
export interface IStudyProgress {
    readonly _id: string;
    userId: string;
    lessonId: string;
    courseId: string;
    status: EStudyProgress;
    createdAt: number;
    isAnswered: boolean;
    updatedAt: number;
}
export enum EStudyProgress {
    NOT_STARTED = 0,
    STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED = 3
}