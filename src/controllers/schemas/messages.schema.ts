import { EContentTypes } from './../../interfaces/messages.interface';
import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { EMessageTypes, Messages } from '../../interfaces/index';

const schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    userId: { type: String, required: true, ref: 'users' },
    lessonId: { type: String },
    type: { type: String, enum: [EMessageTypes.user, EMessageTypes.bot], required: true },
    message: {
        id: { type: Number, required: true },
        content: {
            type: { type: String, required: true, enum: [EContentTypes.file, EContentTypes.photo, EContentTypes.text] },
            link: { type: String, default: null },
            text: { type: String, default: null },
            fileId: { type: String, default: null }
        }
    },
    createdAt: { type: Number, default: Date.now() },
}, { versionKey: false });

schema.plugin(mongoosePaginate);

export default mongoose.model<Messages & mongoose.Document>('messages', schema);