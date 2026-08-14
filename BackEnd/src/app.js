import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

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
                  

//routes declaration

app.use("/api/v1/users", userRouter);


export { app };