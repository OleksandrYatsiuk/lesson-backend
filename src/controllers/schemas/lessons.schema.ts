import { ECourseStatus } from './../../interfaces/courses.interface';
import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { Lesson } from '../../interfaces/index';

const schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    context: { type: String, default: '' },
    courseId: { type: String, ref: 'courses', required: true },
    file: { type: String, default: '' },
    free: { type: Boolean, default: false },
    status: { type: Number, default: ECourseStatus.DRAFT, enum: [ECourseStatus.DRAFT, ECourseStatus.PUBLISHED] },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

schema.plugin(mongoosePaginate);

export default mongoose.model<Lesson & mongoose.Document>('lessons', schema);