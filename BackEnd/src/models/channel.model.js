import mongoose, {Schema} from 'mongoose';

const channelSchema = new Schema(
    {
        name: { type: String, required: true },
        handle: { type: String, required: true, unique: true },
        avatarColor: { type: String, default: '#ff4444' },
        subscribers: { type: Number, default: 0 },
        verified: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);

export const Channel = mongoose.models.Channel || mongoose.model('Channel', channelSchema);
