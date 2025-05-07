import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    productId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', required: true
    },
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    type:
    {
        type: String, enum: ['pickup', 'delivery', 'receive', 'print'],
        required: true
    },
    status:
    {
        type: String, enum: ['Pending Approval', 'Approved', 'Rejected'],
        default: 'Pending Approval'
    },
    createdAt: { type: Date, default: Date.now },
});

export const Request = mongoose.model('Request', requestSchema);