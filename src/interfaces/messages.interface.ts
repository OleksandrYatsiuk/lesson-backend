import * as mongoose from 'mongoose';

export interface Messages extends mongoose.Document {
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

interface Message {
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