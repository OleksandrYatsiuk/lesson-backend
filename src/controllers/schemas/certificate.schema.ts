import { IStudyProgress, EStudyProgress } from '../../interfaces/index';
import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { Certificate } from 'interfaces/certificate.interface';


const certificate = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    progress: { type: Number, default: EStudyProgress.NOT_STARTED },
    fileId: { type: String, required: true },
    fileLink: { type: String, required: true },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

certificate.plugin(mongoosePaginate);

export default mongoose.model<Certificate & mongoose.Document>('certificate', certificate);