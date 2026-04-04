import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ role: 'instructor' }).select('name email isApproved');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

check();
