import dns from "node:dns";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("DNS servers:", dns.getServers());

    const rawUri = process.env.MONGODB_URI?.trim();
    if (!rawUri) {
        throw new Error("MONGODB_URI is not defined");
    }

    const normalizedUri = rawUri.replace(/\/+$/, "");
    const hasDatabase = /\/[^/?]+$/.test(normalizedUri);
    const connectionString = hasDatabase ? normalizedUri : `${normalizedUri}/${DB_NAME}`;

    try {
        console.log("Attempting to connect to MongoDB...");
        const connectionInstance = await mongoose.connect(connectionString);
        console.log("MONGO DB CONNECTED:", connectionInstance.connection.host);
        console.log("Database connection established successfully!");
    }
    catch(error){
        console.error("MONGO DB CONNECTION ERROR:", error.message);
        console.error("Please check your MONGODB_URI and ensure your IP is whitelisted in MongoDB Atlas.");
        process.exit(1);
    }
}

export default connectDB;