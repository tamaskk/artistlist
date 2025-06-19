import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
}

export const connectMongo = async () => {
    try {
        const client = await MongoClient.connect(MONGODB_URI);
        return client;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw new Error("Database connection failed");
    }
};