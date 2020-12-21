import * as mongoose from 'mongoose';

export interface IStaticPages extends mongoose.Document {
    id: string;
    type: EStaticPages;
    content: string;
    createdAt:number;
    updatedAt:number;
}
export enum EStaticPages {
    privacyPolicy = 1,
    termsAndConditions = 2
}