import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('YOUR_USERNAME')) {
    console.warn('MONGODB_URI not configured. Running without database.');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB Atlas connected'))
        .catch((err) => console.error('MongoDB connection error:', err.message));
}

// ─── Schemas & Models ─────────────────────────────────────────────────────────
const channelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    avatarColor: { type: String, default: '#ff4444' },
    subscribers: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
}, { timestamps: true });

const videoSchema = new mongoose.Schema({
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
    category: {
        type: String,
        enum: ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film'],
        default: 'All'
    },
    uploadedAt: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
}, { timestamps: true });

videoSchema.index({ title: 'text', channel: 'text', description: 'text' });

const Video = mongoose.model('Video', videoSchema);
const Channel = mongoose.model('Channel', channelSchema);

// ─── API Routes ───────────────────────────────────────────────────────────────

// GET /api/videos
app.get('/api/videos', async (req, res) => {
    const { category } = req.query;
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database connection not ready' });
        }
        const filter = category && category !== 'All' ? { category } : {};
        const videos = await Video.find(filter).sort({ uploadedAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/videos/:id
app.get('/api/videos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database connection not ready' });
        }
        const video = await Video.findById(id);
        if (!video) return res.status(404).json({ error: 'Video not found' });
        res.json(video);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/search
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database connection not ready' });
        }
        const results = await Video.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/channels
app.get('/api/channels', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database connection not ready' });
        }
        const channels = await Channel.find();
        res.json(channels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
    const cats = ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film'];
    res.json(cats);
});

// GET /api/jokes
app.get('/api/jokes', (req, res) => {
    const jokes = [
        { id: 1, title: 'A 1st joke', content: 'This is a 1st joke' },
        { id: 2, title: 'A 2nd joke', content: 'This is a 2nd joke' },
        { id: 3, title: 'A 3rd joke', content: 'This is a 3rd joke' },
        { id: 4, title: 'A 4th joke', content: 'This is a 4th joke' },
        { id: 5, title: 'A 5th joke', content: 'This is a 5th joke' },
    ];
    res.send(jokes);
});

// GET /api/health
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`BingeWatch server running at http://localhost:${port}`);
});