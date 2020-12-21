import * as mongoose from 'mongoose';

export interface Course extends mongoose.Document {
    readonly id: string;
    name: string;
    status?: ECourseStatus;
    price?: number;
    description?: string;
    createdAt: number;
    updatedAt: number;
}
export interface Lesson extends mongoose.Document {
    readonly id: string,
    name: string,
    context?: string;
    presentation: string;
    video: string;
    file?: string;
    courseId: string;
    free?: boolean;
    status?: number;
    createdAt: number;
    updatedAt: number;
}

export enum ECourseStatus {
    DRAFT = 1,
    PUBLISHED = 2
}