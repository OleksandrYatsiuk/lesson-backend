import { ECourseStatus } from './../../interfaces/courses.interface';
import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { Course } from '../../interfaces/index';

const schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, default: 0 },
    status: { type: Number, default: ECourseStatus.DRAFT },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

schema.plugin(mongoosePaginate);

export default mongoose.model<Course & mongoose.Document>('courses', schema);