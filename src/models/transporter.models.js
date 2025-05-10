import mongoose, { Schema } from "mongoose";

const transporterSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending', 'on the way', 'completed'],
        default: 'pending',
    },
    fromHubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub',
    },
    toHubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub',
    },
},
    {
        timestamps: true,
    });

export const Transporter = mongoose.model('Transporter', transporterSchema);
