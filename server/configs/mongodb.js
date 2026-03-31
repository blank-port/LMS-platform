import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

// Connect to the MongoDB database
const connectDB = async () => {

    mongoose.connection.on('connected', () => console.log('Database Connected'))

    try {
        // Try connecting to Atlas first
        if (process.env.MONGODB_URI) {
            await mongoose.connect(`${process.env.MONGODB_URI}/lms`, {
                serverSelectionTimeoutMS: 5000
            });
            return;
        }
    } catch (err) {
        console.error('Atlas connection failed:', err.message);
        console.log('Attempting to start in-memory MongoDB...');
    }

    // Fallback: Use in-memory MongoDB for local development
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(`${mongoUri}lms`);
    console.log('Using in-memory MongoDB for local development');
}

export default connectDB