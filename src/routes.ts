import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import AstraCollectionHelper from './helpers/AstraCollectionHelper'
import FileContentChunkingHelper from './helpers/FileContentChunkingHelper'
import ChatHelper from './helpers/ChatHelper'
import { OpenAIMessageObject, ResponseBody } from './model';
import { ChatCompletionMessageParam } from 'openai/resources';

const router : Router = express.Router();
const upload : multer.Multer = multer({ dest: 'uploads/' });

router.post("/upload", upload.single('file'), async function (req: Request, res: Response) {
    await AstraCollectionHelper.createCollection();
    const fileStoreInAstraResponse: ResponseBody = await FileContentChunkingHelper.processAndStoreFile(req.file?.path);
    res.status(fileStoreInAstraResponse?.status).json({ "message": fileStoreInAstraResponse.message })
});

router.post("/chat", async function (req: Request<{}, {}, {messages: Array<ChatCompletionMessageParam>}>, res: Response) {
    if (!!!AstraCollectionHelper.dbExists()) {
        res.status(500).json({ "message": "Internal db server error" })
    }
    let { messages } = req.body;
    const response = await ChatHelper.generateResponseStreamFromPrompt(messages);
    res.status(response.status).json({ "message": response.message })
});

export default router;