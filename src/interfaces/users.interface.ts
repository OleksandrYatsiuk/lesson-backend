import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
    readonly id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    code: number;
    chat_id: number;
    courses: string[],
    status: number;
    haveMessages: boolean;
    readonly passwordHash?: string;
    accessToken?: string;
    createdAt: number;
    updatedAt: number;
}
