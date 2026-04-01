import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import CommunicationSetting from './models/CommunicationSetting.js';
import dotenv from 'dotenv';
dotenv.config();

const SCHOLAR_COUNT = 5;

async function seedAuditScholars() {
    console.log('🌱 INITIALIZING AUDIT SEED PROTOCOL...');
    
    // Connect to DB directly for seeding
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Ensure Settings Exist
    const settings = await CommunicationSetting.findOne();
    if (!settings) {
        await CommunicationSetting.create({
            allowQuestionReplyRoles: ['admin', 'instructor'],
            realtimeNotifications: true,
            autoApproveComments: true,
            profanityFilter: false,
            maxMessageLength: 2000
        });
        console.log('⚙️ Institutional Protocols Initialized.');
    }

    for (let i = 0; i < SCHOLAR_COUNT; i++) {
        const email = `audit_scholar_${i}@prismed.test`;
        const password = 'audit_password_123';
        
        // Remove existing to reset state
        await User.deleteOne({ email });
        
        await User.create({
            name: `Scholar Node ${i}`,
            email,
            password, 
            role: 'student',
            isApproved: true,
            gamification: { 
                totalPoints: 10000, 
                currentPoints: 10000, 
                level: 5, 
                badges: [] 
            },
            walletBalance: 0
        });
        console.log(`✅ Scholar Hub Created: ${email}`);
    }

    console.log('🌟 Audit Population Synchronized.');
    await mongoose.disconnect();
}

seedAuditScholars();
