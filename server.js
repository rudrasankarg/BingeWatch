import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

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
    console.warn('⚠️  MONGODB_URI not configured. Running without database (mock data only).');
    console.warn('   Update your .env file with your MongoDB Atlas connection string.');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB Atlas connected'))
        .catch((err) => console.error('❌ MongoDB connection error:', err.message));
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

// Enable text search on title and channel
videoSchema.index({ title: 'text', channel: 'text', description: 'text' });

const Video = mongoose.model('Video', videoSchema);
const Channel = mongoose.model('Channel', channelSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_VIDEOS = [
    {
        title: 'Building a Full Stack App with React & Node.js in 2025',
        description: 'Complete guide to building modern full stack applications. We cover React 19, Express 5, MongoDB, and deployment strategies.',
        channel: 'CodeCraft', channelHandle: '@codecraft', channelAvatarColor: '#6366f1',
        thumbnailGradient: ['#0f0c29', '#302b63', '#24243e'],
        views: 1240000, likes: 54200, dislikes: 420, duration: '1:24:38',
        category: 'Tech', tags: ['react', 'nodejs', 'fullstack'],
    },
    {
        title: 'JavaScript Tips & Tricks That Will Blow Your Mind',
        description: 'Hidden JavaScript features and patterns that senior developers use every day.',
        channel: 'JS Wizard', channelHandle: '@jswizard', channelAvatarColor: '#f59e0b',
        thumbnailGradient: ['#f7971e', '#ffd200'],
        views: 873000, likes: 41000, dislikes: 200, duration: '18:42',
        category: 'Education', tags: ['javascript', 'tips'],
    },
    {
        title: 'Lo-Fi Hip Hop Radio 🎵 Beats to Code/Relax to',
        description: '24/7 lo-fi music stream. Perfect background music for studying, coding, and relaxing.',
        channel: 'ChillBeats', channelHandle: '@chillbeats', channelAvatarColor: '#06b6d4',
        thumbnailGradient: ['#1a1a2e', '#16213e', '#0f3460'],
        views: 45600000, likes: 920000, dislikes: 3800, duration: 'LIVE',
        category: 'Music', tags: ['lofi', 'music', 'chill'],
    },
    {
        title: 'The BEST Gaming Setup of 2025 — Under ₹50,000',
        description: 'Building the ultimate gaming PC on a budget. Full breakdown of components, benchmarks, and buying guide.',
        channel: 'TechGamer IN', channelHandle: '@techgamerin', channelAvatarColor: '#10b981',
        thumbnailGradient: ['#134e5e', '#71b280'],
        views: 2100000, likes: 87000, dislikes: 1200, duration: '32:15',
        category: 'Gaming', tags: ['gaming', 'setup', 'pcbuild'],
    },
    {
        title: 'MongoDB Atlas Tutorial — From Zero to Production',
        description: 'Learn MongoDB Atlas from scratch. Covers clusters, collections, indexes, and connecting with Mongoose.',
        channel: 'DB Mastery', channelHandle: '@dbmastery', channelAvatarColor: '#22c55e',
        thumbnailGradient: ['#11998e', '#38ef7d'],
        views: 340000, likes: 18000, dislikes: 150, duration: '45:07',
        category: 'Tech', tags: ['mongodb', 'database', 'atlas'],
    },
    {
        title: 'Quantum Computing Explained Simply',
        description: 'A beginner-friendly explanation of quantum computing, qubits, superposition, and what it means for the future.',
        channel: 'Science Unlocked', channelHandle: '@scienceunlocked', channelAvatarColor: '#8b5cf6',
        thumbnailGradient: ['#4776e6', '#8e54e9'],
        views: 5600000, likes: 230000, dislikes: 2100, duration: '22:33',
        category: 'Science', tags: ['quantum', 'physics', 'science'],
    },
    {
        title: 'CSS Glassmorphism UI Design Tutorial 2025',
        description: 'Create stunning glassmorphism UI components using pure CSS. No frameworks needed.',
        channel: 'DesignCode', channelHandle: '@designcode', channelAvatarColor: '#ec4899',
        thumbnailGradient: ['#ee0979', '#ff6a00'],
        views: 670000, likes: 31000, dislikes: 300, duration: '15:20',
        category: 'Tech', tags: ['css', 'design', 'ui'],
    },
    {
        title: 'IPL 2025 Highlights — The Greatest Comeback Ever',
        description: 'Relive the most dramatic moments from IPL 2025. Full match highlights and analysis.',
        channel: 'Cricket Central', channelHandle: '@cricketcentral', channelAvatarColor: '#f97316',
        thumbnailGradient: ['#f7971e', '#ffd200'],
        views: 12400000, likes: 540000, dislikes: 8900, duration: '28:14',
        category: 'Sports', tags: ['ipl', 'cricket', 'sports'],
    },
    {
        title: 'Stand Up Comedy Compilation — Best of 2025',
        description: 'The funniest stand-up moments of 2025. Features clips from top comedians worldwide.',
        channel: 'LaughFactory', channelHandle: '@laughfactory', channelAvatarColor: '#eab308',
        thumbnailGradient: ['#f953c6', '#b91d73'],
        views: 8900000, likes: 410000, dislikes: 5600, duration: '1:02:11',
        category: 'Comedy', tags: ['comedy', 'standup', 'funny'],
    },
    {
        title: 'Breaking News: Space Mission Update 2025',
        description: 'Live coverage of the latest space exploration missions. Expert analysis and real-time updates.',
        channel: 'SpaceNewsNow', channelHandle: '@spacenewsnow', channelAvatarColor: '#0ea5e9',
        thumbnailGradient: ['#0f0c29', '#302b63'],
        views: 3200000, likes: 98000, dislikes: 2400, duration: '44:55',
        category: 'News', tags: ['space', 'news', 'nasa'],
    },
    {
        title: 'React 19 All New Features Explained',
        description: 'Deep dive into React 19: Server Components, Actions, use() hook, and all breaking changes explained.',
        channel: 'CodeCraft', channelHandle: '@codecraft', channelAvatarColor: '#6366f1',
        thumbnailGradient: ['#1FA2FF', '#12D8FA', '#A6FFCB'],
        views: 780000, likes: 34000, dislikes: 280, duration: '38:20',
        category: 'Tech', tags: ['react', 'javascript', 'webdev'],
    },
    {
        title: 'How I Made ₹1 Crore with YouTube in 2 Years',
        description: 'My complete journey from 0 to 1 million subscribers. Monetization strategies, brand deals, and more.',
        channel: 'Creator Blueprint', channelHandle: '@creatorblueprint', channelAvatarColor: '#d946ef',
        thumbnailGradient: ['#FFD700', '#FF8C00'],
        views: 9800000, likes: 480000, dislikes: 12000, duration: '26:40',
        category: 'Education', tags: ['youtube', 'creator', 'money'],
    },
];

async function seedDatabase() {
    if (!mongoose.connection.readyState) return;
    try {
        const count = await Video.countDocuments();
        if (count === 0) {
            await Video.insertMany(SEED_VIDEOS);
            console.log(`🌱 Seeded ${SEED_VIDEOS.length} videos into MongoDB`);
        }
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
    }
}

mongoose.connection.once('open', seedDatabase);

// ─── API Routes ───────────────────────────────────────────────────────────────

// GET /api/videos — all videos (with optional ?category= filter)
app.get('/api/videos', async (req, res) => {
    const { category } = req.query;
    try {
        if (mongoose.connection.readyState === 1) {
            const filter = category && category !== 'All' ? { category } : {};
            const videos = await Video.find(filter).sort({ uploadedAt: -1 });
            return res.json(videos);
        }
        // Fallback to mock data if DB not connected
        const filtered = category && category !== 'All'
            ? SEED_VIDEOS.filter(v => v.category === category)
            : SEED_VIDEOS;
        res.json(filtered.map((v, i) => ({ ...v, _id: String(i + 1) })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/videos/:id — single video
app.get('/api/videos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (mongoose.connection.readyState === 1) {
            const video = await Video.findById(id);
            if (!video) return res.status(404).json({ error: 'Video not found' });
            return res.json(video);
        }
        // Fallback
        const index = parseInt(id, 10) - 1;
        if (index < 0 || index >= SEED_VIDEOS.length) return res.status(404).json({ error: 'Video not found' });
        res.json({ ...SEED_VIDEOS[index], _id: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/search?q= — text search
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        if (mongoose.connection.readyState === 1) {
            const results = await Video.find(
                { $text: { $search: q } },
                { score: { $meta: 'textScore' } }
            ).sort({ score: { $meta: 'textScore' } });
            return res.json(results);
        }
        // Fallback: in-memory filter
        const lower = q.toLowerCase();
        const results = SEED_VIDEOS.filter(v =>
            v.title.toLowerCase().includes(lower) ||
            v.channel.toLowerCase().includes(lower) ||
            v.description.toLowerCase().includes(lower) ||
            v.tags.some(t => t.includes(lower))
        );
        res.json(results.map((v, i) => ({ ...v, _id: String(i + 1) })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/channels — all channels
app.get('/api/channels', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const channels = await Channel.find();
            return res.json(channels);
        }
        // Derive from seed data
        const channels = [...new Map(SEED_VIDEOS.map(v => [v.channelHandle, {
            name: v.channel,
            handle: v.channelHandle,
            avatarColor: v.channelAvatarColor,
        }])).values()];
        res.json(channels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/categories — unique categories
app.get('/api/categories', async (req, res) => {
    const cats = ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film'];
    res.json(cats);
});

// ─── Original Jokes Route (unchanged) ────────────────────────────────────────
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

// ─── Health Check ─────────────────────────────────────────────────────────────
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
    console.log(`🚀 BingeWatch server running at http://localhost:${port}`);
});