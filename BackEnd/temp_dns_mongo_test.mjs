import dns from "node:dns";
import dotenv from "dotenv";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
console.log("dns servers:", dns.getServers());

dotenv.config({ path: "./.env" });
const DB_NAME = "youtube";
const uri = process.env.MONGODB_URI?.trim();
console.log('uri=', uri);
try {
  const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`);
  console.log('connected', connectionInstance.connection.host);
} catch (error) {
  console.error('error', error);
  process.exit(1);
}
