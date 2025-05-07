import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    uniqueCode:
    {
        type: Number,
        required: true,
        unique: true
    },
    name:
    {
        type: String,
        required: true
    },
    description:
    {
        type: String,
        required: true
    },
    weight:
    {
        type: Number,
        required: true
    },
    measurement:
    {
        type: Number,
        required: true
    },
    fromHubId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub', required: true
    },
    toHubId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub', required: true
    },
    shipperId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    receiverId:
    {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'User', required: true
    },
    transporterId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'On the way', 'Reached', 'Pending Receipt Approval', 'Received', 'Canceled'],
        default: 'Pending',
    },
    amount:
    {
        type: Number,
        required: true
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
    locations: [
        {
            hubId:
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Hub'
            },
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

export const Product = mongoose.model('Product', productSchema);
