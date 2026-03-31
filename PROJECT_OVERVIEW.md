# PrismEd: Shaping Skills - Project Master Document

## 🚀 Vision & Identity
**PrismEd** is a premium, high-fidelity Learning Management System (LMS) engineered for the modern educator. Rebranded from the legacy "LMS Pro" architecture, PrismEd focuses on a minimalist, data-driven experience that empowers instructors and students through sleek design and robust synchronization.

- **Tagline**: Shaping Skills.
- **Aesthetic**: Minimalist Glassmorphic UI with role-specific sequestration.
- **Core Value**: Universal Identity Sync & Engagement-First learning.

---

## 🛠 Modern Tech Stack
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide-React, Recharts (Analytics), Framer Motion.
- **Backend**: Node.js, Express.js (Role-based Authorization Middleware).
- **Database**: MongoDB (Mongoose) with Cloud-Synchronized Schemas.
- **Storage/Media**: Cloudinary (Image/Avatar processing), Multer (Multipart parsing).
- **Communication**: Threaded Messaging & Noticeboard broadcast system.

---

## 🏗 High-Fidelity Architecture
The system is architected as a decoupled MERN platform with three distinct operating environments:
1. **Student Panel**: Clean, distracted-free learning interface with progress tracking and badge gamification.
2. **Educator Studio**: Professional analytics hub with InfixLMS-inspired modules for Scholar management and Question design.
3. **Admin Registry**: Global configuration, financial oversight, and site-wide state management.

### Key Protocols
- **Universal Identity Sync**: A 7-tab educator settings suite allowing atomic synchronization of Academic, Fiscal, and Professional vectors.
- **Prism Authorization Protocol**: Secure `Authorization: Bearer` JWT handshake for all protected identities.
- **Engagement Nexus**: Cross-panel announcement and signaling (messaging) system.

---

## ✨ Primary Modules

### 1. Educator Studio (Professional Panel)
- **Analytics Hub**: 6+ Premium Metric Cards (Revenue, Students, Daily Gross) with interactive Recharts trends.
- **Scholar Network (Users)**: Dynamic enrolled student list with course-specific filtering and proactive "Signal" (Messaging) outreach.
- **Question Vault (Education)**: Centralized repository for complex question nexuses and bulk-import quiz building.
- **Engagement Nexus (Communication)**: Broadcast noticeboard for system directives and threaded private signaling.
- **7-Tab Settings Suite**: Comprehensive profile control (Identity, Narrative, Acumen, Skills, Fiscal, Social, Security).

### 2. Student Learning Experience
- **Interactive Dashboard**: Real-time progress monitoring and recent "System Directives" (Notices).
- **Course Nexus**: Multimedia curriculum player with internal discussion threads.
- **Gamification**: certification authority with "PRISM-" verified prefixes.

### 3. Administrative Oversight
- **System Config**: Total control over themes (Dark/Light), localization (10+ languages), and SEO metadata.
- **Fiscal Control**: Global revenue auditing and automated instructor payout management.

---

## 📁 Critical Schema Map
- **User**: Identity (headline, dob), Narrative (about), Acumen (education/experience), Skills, Payouts, Social.
- **Notice**: Global/Targeted broadcasting system for the Engagement Nexus.
- **QuestionBank/Group**: Knowledge repository for assessment injection.
- **WalletTransaction**: Financial ledger for revenue and withdrawal auditing.

---

## 🚦 Operational Guide
1. **Launch Server**: `cd server && node server.js` (Default Port 5000).
2. **Launch Client**: `cd client && npm run dev` (Vite Environment).
3. **Environment Sync**: Requires `.env` config for MongoDB URI, JWT_SECRET, and Cloudinary keys.

---

## 🤖 Handoff Instructions for Antigravity
- **Styling**: Adhere to the "Absolutely Clean" minimalist aesthetic. Use HSL palettes and glassmorphism.
- **Auth**: Always include `Authorization: Bearer <token>` in API handshakes.
- **Models**: Ensure alignment with the `User.js` extension fields (headline, dob, institution).
- **Branding**: Never use "LMS Pro" or "LMS". Always reference **PrismEd**.

---
*Last Synchronized: 2026-03-24 | PrismEd Engine v2.5*
