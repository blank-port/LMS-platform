import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import seedDatabase from './configs/seedDB.js';

const runSeeding = async () => {
    try {
        await connectDB();
        await seedDatabase();
        console.log('--- SEEDING COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

runSeeding();
