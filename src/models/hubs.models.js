import mongoose from 'mongoose';

const hubSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
        unique: true
    },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },
    hubCode: { type: String, unique: true },
});

// generate a unique code when creating a new hub
hubSchema.pre('save', async function (next) {
    if (!this.isNew) return next();
    let code = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    const existingHub = await Hub.findOne({ hubCode: code });
    if (existingHub) {
        return next(new Error('Unique code generation conflict. Please try again.'));
    }
    this.hubCode = code;
    }
    next();
});

export const Hub = mongoose.model('Hub', hubSchema);

// Pre-populate hubs if none exist
const initialHubs = [
    { name: 'Hub1', coordinates: { lat: 23.8103, lng: 90.4125 } },
    { name: 'Hub2', coordinates: { lat: 23.8041, lng: 90.4152 } },
    { name: 'Hub3', coordinates: { lat: 23.7985, lng: 90.4089 } },
    { name: 'Hub4', coordinates: { lat: 23.7903, lng: 90.4012 } },
    { name: 'Hub5', coordinates: { lat: 23.7809, lng: 90.3956 } },
    { name: 'Hub6', coordinates: { lat: 23.7705, lng: 90.3890 } },
    { name: 'Hub7', coordinates: { lat: 23.7601, lng: 90.3823 } },
    { name: 'Hub8', coordinates: { lat: 23.7497, lng: 90.3756 } },
    { name: 'Hub9', coordinates: { lat: 23.7393, lng: 90.3689 } },
    { name: 'Hub10', coordinates: { lat: 23.7289, lng: 90.3622 } },
];

Hub.countDocuments().then((count) => {
    if (count === 0) {
        Hub.insertMany(initialHubs)
            .then(() => console.log('Initial hubs inserted'))
            .catch((err) => console.error('Error inserting hubs:', err));
    }
});
 