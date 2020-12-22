

export interface Messages  {
    readonly id: string;
    chat_id?: number;
    userId: string;
    lessonId: string;
    type: EMessageTypes;
    message: Message;
    createdAt?: number;
}
export interface CustomMessage {
    readonly id?: string;
    userId: string;
    lessonId: string;
    type: EMessageTypes;
    message: Message;
    createdAt?: number;
}

export interface Message {
    id: number;
    content?: MessageOptions;
}
export interface MessageOptions {
    type: EContentTypes;
    link: string | null;
    text: string | null;
    fileId: string;
}

export enum EContentTypes {
    file = 'file',
    photo = 'photo',
    text = 'text'
}
export enum EMessageTypes {
    bot = 'bot',
    user = 'user'
}