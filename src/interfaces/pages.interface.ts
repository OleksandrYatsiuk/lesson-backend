
export interface IStaticPages {
    id: string;
    type: EStaticPages;
    content: string;
    createdAt: number;
    updatedAt: number;
}
export enum EStaticPages {
    privacyPolicy = 1,
    termsAndConditions = 2
}