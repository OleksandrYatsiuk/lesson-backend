import * as mongoose from 'mongoose';

export interface Certificate extends mongoose.Document {
    readonly _id: string;
    userId: string;
    courseId: string;
    fileId: string;
    fileLink: string;
    createdAt: number;
    updatedAt: number;
}
