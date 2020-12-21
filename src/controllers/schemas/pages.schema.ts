import * as mongoose from 'mongoose';
import { IStaticPages } from '../../interfaces/index';

const schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    type: { type: Number, required: true },
    content: { type: String, default: '' },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });


export default mongoose.model<IStaticPages & mongoose.Document>('pages', schema);