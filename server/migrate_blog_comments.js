import mongoose from 'mongoose';
import Blog from './models/Blog.js';
import Comment from './models/Comment.js';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    try {
        console.log('🚀 INITIALIZING BLOG COMMENT MIGRATION...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to Infrastructure');

        const blogs = await Blog.find({ 'comments.0': { $exists: true } });
        console.log(`📊 Found ${blogs.length} blogs with embedded discourse.`);

        let count = 0;
        for (const blog of blogs) {
            for (const legacyComment of blog.comments) {
                // Check if already migrated to avoid duplicates
                const existing = await Comment.findOne({
                    user: legacyComment.user,
                    targetId: blog._id,
                    content: legacyComment.text,
                    createdAt: legacyComment.createdAt
                });

                if (!existing) {
                    await Comment.create({
                        user: legacyComment.user,
                        targetId: blog._id,
                        targetType: 'Blog',
                        content: legacyComment.text,
                        status: 'approved', // Legacy comments assumed approved
                        createdAt: legacyComment.createdAt
                    });
                    count++;
                }
            }
        }

        console.log(`✅ Migration Success: ${count} discourse nodes transitioned to the Strategic Nexus.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Critical Failure:', error);
        process.exit(1);
    }
};

migrate();
