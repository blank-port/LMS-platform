import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const diag = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
        console.log('Connected to DB');

        const admin = await User.findOne({ email: 'admin@prismed.com' });
        if (!admin) {
            console.log('❌ Admin user NOT FOUND');
        } else {
            console.log('✅ Admin user FOUND');
            console.log('Role:', admin.role);
            const isMatch = await bcrypt.compare('admin123', admin.password);
            console.log('Password Match (admin123):', isMatch ? '✅ YES' : '❌ NO');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

diag();
