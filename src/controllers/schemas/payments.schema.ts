import * as mongoose from 'mongoose';
import { Payment, PaymentData } from 'interfaces/payments.interface';

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'courses' },
    status: { type: String, default: null },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false});


export default mongoose.model<PaymentData & mongoose.Document>('payments', schema);