import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";




try{
    await connectDB().then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });
    });
} catch(error){
    console.error("ERROR:", error);
    throw error;
}















































/*
import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.error("ERROR: Server error", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch(error){
        console.error("ERROR:", error);
        throw error;
    }
})();
*/