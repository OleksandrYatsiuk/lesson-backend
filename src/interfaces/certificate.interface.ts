
export interface Certificate  {
    readonly _id: string;
    userId: string;
    courseId: string;
    fileId: string;
    fileLink: string;
    createdAt: number;
    updatedAt: number;
}
