import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    featuredImage: { type: String, default: '' },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    views: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema);
