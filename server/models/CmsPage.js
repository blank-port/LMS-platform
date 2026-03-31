import mongoose from 'mongoose';

const cmsPageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, default: '' },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    featuredImage: { type: String, default: '' },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    sortOrder: { type: Number, default: 0 },
    pageType: { type: String, enum: ['page', 'section', 'banner'], default: 'page' },
    sectionData: {
        // For homepage sections: banner, features, testimonials, CTA, FAQ
        heroTitle: String,
        heroSubtitle: String,
        heroCtaText: String,
        heroCtaUrl: String,
        heroBackground: String,
        features: [{
            icon: String,
            title: String,
            description: String
        }],
        testimonials: [{
            name: String,
            role: String,
            photo: String,
            text: String
        }],
        faqs: [{
            question: String,
            answer: String
        }]
    }
}, { timestamps: true });

export default mongoose.model('CmsPage', cmsPageSchema);
