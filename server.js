import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import os from 'os';

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();
dotenv.config({ path: './BackEnd/.env' });

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: os.tmpdir() });

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
    videoUrl: { type: String, default: '' },
    owner: { type: String, default: '' },
    category: {
        type: String,
        enum: ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film', 'Other'],
        default: 'All'
    },
    uploadedAt: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
}, { timestamps: true });

videoSchema.index({ title: 'text', channel: 'text', description: 'text' });

const Video = mongoose.model('Video', videoSchema);
const Channel = mongoose.model('Channel', channelSchema);

// ─── API Routes ───────────────────────────────────────────────────────────────

// POST /api/videos (Create new video with file upload)
app.post('/api/videos', upload.single('videoFile'), async (req, res) => {
    const { title, description, category, channel, channelHandle, channelAvatarColor, owner } = req.body;

    if (!title || !channel || !channelHandle) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Title, channel, and channelHandle are required' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Video file is required' });
    }

    try {
        if (mongoose.connection.readyState !== 1) {
            fs.unlinkSync(req.file.path);
            return res.status(503).json({ error: 'Database connection not ready' });
        }

        // Upload video to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'bingewatch_videos'
        });

        // Delete temp local file
        fs.unlinkSync(req.file.path);

        // Generate a random gradient for the video thumbnail
        const colors = [
            '#ff4e50', '#f9d423', '#e1eec3', '#f05053', '#e15f41', 
            '#c44569', '#574b90', '#3dc1d3', '#f78fb3', '#cf6a87', 
            '#546de5', '#e15f41', '#f8a5c2', '#f5cd79', '#63cdda', 
            '#778beb', '#786fa6'
        ];
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        const thumbnailGradient = [color1, color2];

        // Format duration based on actual duration returned by Cloudinary
        const durationSecs = uploadResult.duration || 0;
        const min = Math.floor(durationSecs / 60);
        const sec = Math.floor(durationSecs % 60).toString().padStart(2, '0');
        const duration = `${min}:${sec}`;

        const video = new Video({
            title,
            description,
            category: category || 'All',
            channel,
            channelHandle,
            channelAvatarColor: channelAvatarColor || '#6366f1',
            thumbnailGradient,
            duration,
            videoUrl: uploadResult.secure_url,
            owner: owner || channelHandle,
            views: 0,
            likes: 0,
            dislikes: 0,
            uploadedAt: new Date()
        });

        await video.save();
        res.status(201).json(video);
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/videos/:id (Delete a video)
app.delete('/api/videos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database connection not ready' });
        }
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        await Video.findByIdAndDelete(id);
        res.json({ message: 'Video deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
    const cats = ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film', 'Other'];
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