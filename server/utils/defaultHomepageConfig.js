const defaultHomepageConfig = {
    theme: {
        primary: '#0f766e',
        primaryHover: '#115e59',
        accent: '#f59e0b',
        surfaceTint: '#ecfeff'
    },
    hero: {
        eyebrow: 'Premium Learning System',
        title: 'Build momentum with modern learning experiences',
        highlight: 'that feel premium',
        subtitle: 'PrismEd helps students, educators, and administrators move through learning flows with clarity, speed, and confidence.',
        primaryCtaLabel: 'Explore Courses',
        primaryCtaLink: '/course-list',
        secondaryCtaLabel: 'Become an Instructor',
        secondaryCtaLink: '/register',
        metrics: [
            { value: '250+', label: 'Active courses' },
            { value: '45K+', label: 'Learners' },
            { value: '120+', label: 'Educators' }
        ]
    },
    features: {
        enabled: true,
        title: 'Everything needed to run a modern LMS',
        subtitle: 'A polished learning experience for every role on the platform.',
        cards: [
            { icon: 'Sparkles', title: 'Premium Learning UX', description: 'Clear navigation, better visual hierarchy, and fast interactions across the platform.' },
            { icon: 'MonitorPlay', title: 'Smart Course Delivery', description: 'Structured course journeys, progress tracking, and cleaner in-player learning flows.' },
            { icon: 'ShieldCheck', title: 'Powerful Admin Control', description: 'Control settings, approvals, content, finance, and communication from one place.' }
        ]
    },
    showcase: {
        enabled: true,
        title: 'Featured learning paths',
        subtitle: 'Surface your strongest courses with a premium, high-conversion showcase.',
        mode: 'featured',
        selectedCourseIds: []
    },
    testimonials: {
        enabled: true,
        title: 'Loved by ambitious learners',
        subtitle: 'Showcase trust and momentum through student success stories.',
        items: [
            { name: 'Aarav Mehta', role: 'Frontend Developer', feedback: 'PrismEd made the course journey feel organized, premium, and motivating from day one.', rating: 5, image: '' },
            { name: 'Sara Khan', role: 'Design Student', feedback: 'The learning experience feels smooth and focused. It is much easier to stay consistent here.', rating: 5, image: '' },
            { name: 'Riya Sharma', role: 'Upskilling Professional', feedback: 'I can track my progress clearly, resume fast, and actually enjoy using the platform.', rating: 5, image: '' }
        ]
    },
    cta: {
        enabled: true,
        title: 'Ready to level up your learning platform?',
        subtitle: 'Give students a premium learning experience and help educators manage content with confidence.',
        primaryCtaLabel: 'Start Learning',
        primaryCtaLink: '/course-list',
        secondaryCtaLabel: 'Launch Teaching Panel',
        secondaryCtaLink: '/register',
        bullets: [
            'Premium course experience',
            'Instructor-ready workflows',
            'Admin-controlled homepage',
            'Responsive modern UI'
        ]
    }
};

export default defaultHomepageConfig;
