# PrismEd: Shaping Skills - Project Master Document

## 🚀 Vision & Identity
**PrismEd** is a premium, high-fidelity Learning Management System (LMS) engineered for the modern educator. Moving beyond traditional learning, PrismEd is an **AI-Augmented Ecosystem** focused on a minimalist, data-driven experience that empowers instructors and students through sleek design, neural intelligence, and real-time synchronization.

- **Tagline**: Shaping Skills.
- **Aesthetic**: Minimalist Glassmorphic UI with role-specific sequestration.
- **Core Value**: Universal Identity Sync, AI-Driven Mentorship, & Real-Time Engagement.

---

## 🛠 Modern Tech Stack
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide-React, Recharts (Analytics), Framer Motion.
- **Backend**: Node.js, Express.js (Role-based Authorization Middleware), Crypto (Timing-Safe Sig Verification).
- **Intelligence**: **Google Gemini AI** (Neural Analysis, Content Synthesis, Viva Simulation).
- **Synchronization**: **Pusher** (Real-time signaling, Threaded Messaging, Live Notifications).
- **Database**: MongoDB (Mongoose) with Cloud-Synchronized Schemas.
- **Security**: Centralized `ProtectedRoute` Protocol, Multer Strict-Type Ingestion (5MB Limit).
- **Media**: Cloudinary (Image processing), Multer (Validated Multipart parsing).

---

## 🏗 High-Fidelity Architecture
The system is architected as a decoupled MERN platform with three distinct operating environments, now enhanced with a cross-cutting **Intelligence Layer**:

1. **Student Panel**: AI-powered learning interface with **Neural Study Directives**, **Viva Simulations**, and **Referral Network** incentives.
2. **Educator Studio**: Professional analytics hub with **Live-Ops Infrastructure**, Cohort management, and AI-assisted curriculum design.
3. **Admin Registry**: Global configuration, financial oversight, and **Strategic Intelligence** (Demand tracking).

### Key Protocols
- **Prism Security Shield**: Centralized Protected Route wrapper enforcing specific role permissions (Admin/Educator/Scholar).
- **Neural Analysis Engine**: Real-time weakness detection and personalized study plan generation via Gemini AI.
- **Engagement Nexus**: Pusher-backed real-time messaging and noticeboard system with WhatsApp-style fidelity.
- **Fiscal Integrity Protocol**: Timing-safe cryptographic verification for all external payment handshakes (Razorpay).
- **Live-Ops Sync**: Real-time cohort synchronization and live session management.

---

## ✨ Primary Modules

### 1. Educator Studio (Professional Panel)
- **Analytics Hub**: 6+ Premium Metric Cards (Revenue, Students, Daily Gross) with interactive Recharts trends.
- **Live-Ops & Cohorts**: Management of student groups and scheduled Live Sessions with real-time participant tracking.
- **Neural Curriculum Design**: AI-generated course outlines, quiz questions, and lesson summaries.
- **Scholar Network**: Dynamic enrolled student list with course-specific filtering and proactive "Signal" (Messaging) outreach.

### 2. Student Learning Experience
- **AI Mentor (PrismBot)**: Context-aware assistant that tracks progress and provides page-specific academic guidance.
- **Neural Flashcards**: AI-synthesized, persisted knowledge cards for active recall and lesson reinforcement.
- **Viva Simulation**: Interactive AI-driven mock interviews with performance auditing and feedback loops.
- **Course Nexus**: Multimedia curriculum player with internal discussion threads and automated completion credentials.
- **Fiscal Wallet**: Integrated transaction ledger supporting referral bonuses (₹50/enrollment) and intelligent point redemption.

### 3. Administrative Oversight & Stability
- **Strategic Intelligence**: Automated tracking of missing course "Demand" to inform curriculum growth.
- **System Config**: Total control over themes, localization, SEO, and **Encrypted Platform Secrets** (Gemini, Pusher, Razorpay).
- **Fiscal Control**: Global revenue auditing and automated instructor payout management.
- **Health Infrastructure**: Integrated `/api/health` endpoint for real-time monitoring of system vitals.

---

## 📁 Critical Schema Map
- **User**: Identity (headline, dob), Narrative (about), Referral Tracking (referredBy, referralCode).
- **CourseRequest**: Strategic tracking of user search intent for unfulfilled curriculum needs.
- **ChatSession**: Persistent records of scholarly dialogue and AI interactions.
- **Flashcard**: AI-generated study aids mapped to specific lessons and student identities.
- **LiveSession & Cohort**: Real-time group learning structures and synchronization nodes.
- **WalletTransaction**: Financial ledger for revenue, referral bonuses, and withdrawal auditing.

---

## 🚦 Operational Guide
1. **Launch Server**: `cd server && npm start` (Default Port 5001).
2. **Launch Client**: `cd client && npm run dev` (Vite Environment).
3. **Environment Sync**: Ensure `GEMINI_API_KEY` and `PUSHER_` credentials are set in `.env`.

---

## 🤖 Handoff Instructions for Antigravity
- **Aesthetic**: Maintain the "Absolutely Clean" minimalist glassmorphism.
- **Intelligence**: Leverage `aiController` for any new educational tools. Ensure AI responses are role-aware.
- **Real-Time**: Use `pusherService` for all cross-panel signaling and notifications.
- **Branding**: Always reference **PrismEd**. Use "Scholar" for students and "Educator" for instructors.

---
*Last Synchronized: 2026-04-24 | PrismEd Engine v4.0 (Phase 6: Intelligence & Live-Ops Integrated)*
