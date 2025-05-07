import mongoose from 'mongoose';

const hubSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
        unique: true
    },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },
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
 