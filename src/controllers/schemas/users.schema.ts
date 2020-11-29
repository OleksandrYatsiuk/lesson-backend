import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { User } from '../../interfaces/index';

const userSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, unique: true, required: true },
    chat_id: { type: Number, unique: true },
    status: { type: Number, default: 0 },
    code: { type: Number, default: null },
    role: { type: String, default: 'subscriber' },
    haveMessages: { type: Boolean, default: false },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

userSchema.plugin(mongoosePaginate);

export default mongoose.model<User & mongoose.Document>('users', userSchema);