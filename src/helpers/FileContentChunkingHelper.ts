import fs from "fs";

import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import OpenAIHelper from './OpenAIHelper';

import AstraCollectionHelper from "./AstraCollectionHelper";
import { ResponseBody } from "../model";

export default {
    processAndStoreFile: async (filePath: string) : Promise<ResponseBody> => {
        if (!filePath) {
            return {
                error: true,
                status: 400,
                message: "No File Uploaded"
            };
        }

        try {
            const content = fs.readFileSync(filePath, "utf-8");
            const documents = [new Document({ pageContent: content })];

            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 512, chunkOverlap: 100 });
            const chunks = await textSplitter.splitDocuments(documents);
            if(!AstraCollectionHelper.dbExists()) return null;
            const collection = await AstraCollectionHelper.getCollection();
            for await (const chunk of chunks) {
                const vector = await OpenAIHelper.getVectorFromNewEmbedding(chunk.pageContent);
                await collection?.insertOne({
                    $vector: vector,
                    text: chunk
                });
            }

            // Clean up uploaded file
            fs.unlinkSync(filePath);
            return {
                error: false,
                status: 200,
                message: "File processed and data stored successfully."
            };
        } catch (error) {
            console.error("Error processing file:", error);
            return {
                error: true,
                status: 500,
                message: "Failed to process the file."
            };
        }
    }

}

