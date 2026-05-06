import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;
const isProductionRuntime = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

// Connect to the MongoDB database
const connectDB = async () => {

    mongoose.connection.on('connected', () => console.log('Database Connected'))

    try {
        // Try connecting to Atlas first
        if (process.env.MONGODB_URI) {
            console.log('Connecting to MongoDB Atlas...');
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000,
            });
            return;
        }

        console.error('CRITICAL: MONGODB_URI is missing from environment variables.');
        if (isProductionRuntime) {
            throw new Error('Production environments require a valid MONGODB_URI.');
        }
    } catch (err) {
        console.error('CRITICAL: Atlas connection failed:', err.message);
        
        // In local development, we can fallback, but in production, we must fail.
        if (isProductionRuntime) {
            console.error('Deployment Failure: Terminating process. Please ensure MONGODB_URI is configured and reachable from this environment.');
            throw err;
        }
        
        console.log('Development context: Falling back to in-memory MongoDB...');
    }

    // Fallback: Use in-memory MongoDB ONLY for local development
    try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(`${mongoUri}lms`);
        console.log('Using in-memory MongoDB for development session.');
    } catch (mmsErr) {
        console.error('Fatal: Failed to initialize even the in-memory database:', mmsErr.message);
        process.exit(1);
    }
}

export default connectDB
