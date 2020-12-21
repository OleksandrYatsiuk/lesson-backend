import { IStudyProgress } from 'interfaces/study.interface';
import * as mongoose from 'mongoose';
import lessonsModel from '../../schemas/lessons.schema';

export class InsertProgress {
    public model: mongoose.PaginateModel<IStudyProgress & mongoose.Document>;
    public lessonsModel = lessonsModel;
    constructor(model: mongoose.PaginateModel<IStudyProgress & mongoose.Document>) {
        this.model = model;
    }

    public insertMany(id: string, chat_id?: number): Promise<any> {
        return this.lessonsModel.find().then(lessons => {
            const data = lessons.map(el => ({
                lessonId: el._id, courseId: el.courseId, userId: id,
                chat_id: chat_id, isAnswered: true, status: false, progress: 0
            }));
            return this.model.insertMany(data)
        })
    }
    
    public deleteMany(userId: string): Promise<any> {
        return this.model.deleteMany({ userId }).exec()
    }
}