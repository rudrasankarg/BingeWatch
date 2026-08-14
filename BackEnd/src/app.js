import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

import connectDB from "./db/index.js";
// Initialize database connection for serverless environments (e.g., Vercel)
connectDB().catch(console.dir);

// Debug route to test body parsing
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.static("public"));
app.use(cookieParser());

// Debug endpoint to test body parsing
app.post("/debug", (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    res.json({ received: req.body });
});

//routes

import userRouter from "./routes/user.routes.js"; 
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import commentRouter from "./routes/comment.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/comments", commentRouter);

// error handler middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || []
    });
});

export default app;