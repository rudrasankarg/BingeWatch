import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        channel: { type: String, required: true },
        channelHandle: { type: String, required: true },
        channelAvatarColor: { type: String, default: '#ff4444' },
        thumbnailGradient: { type: [String], default: ['#1a1a2e', '#16213e'] },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        duration: { type: String, default: '0:00' },
        videoUrl: { type: String, default: '' },
        owner: { type: String, default: '' },
        category: {
            type: String,
            enum: ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film', 'Other'],
            default: 'All'
        },
        uploadedAt: { type: Date, default: Date.now },
        tags: { type: [String], default: [] },
    },
    {
        timestamps: true
    }
);

videoSchema.index({ title: 'text', channel: 'text', description: 'text' });
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);