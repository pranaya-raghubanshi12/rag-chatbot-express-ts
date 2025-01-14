export interface ResponseBody {
    error: boolean,
    status: number,
    message: string
}

export interface OpenAIPrompTemplate {
    role: string,
    content: string
}

export interface OpenAIMessageObject {
    type: string,
    content: string
}