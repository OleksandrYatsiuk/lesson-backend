import { IStudyProgress, EStudyProgress } from './../../interfaces/study.interface';
import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';


const study = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'lessons' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    progress: { type: Number, default: EStudyProgress.NOT_STARTED },
    status: { type: Number, default: false },
    isAnswered: { type: Boolean, default: true },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

study.plugin(mongoosePaginate);

export default mongoose.model<IStudyProgress & mongoose.Document>('study', study);