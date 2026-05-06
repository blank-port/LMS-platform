import React, { useEffect, useMemo, useState } from 'react';
import api from '@/utils/api';
import { toast } from 'react-toastify';
import { defaultHomepageConfig, mergeHomepageConfig } from '../../../utils/homepageConfig';

const SectionCard = ({ title, subtitle, children }) => (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 shadow-sm">
        <div className="mb-6">
            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm font-medium text-[var(--text-muted)]">{subtitle}</p> : null}
        </div>
        {children}
    </section>
);

const Input = ({ label, value, onChange, placeholder }) => (
    <label className="block space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</span>
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-3.5 text-sm font-semibold text-[var(--text-main)] outline-none transition focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10"
        />
    </label>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 4 }) => (
    <label className="block space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</span>
        <textarea
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-3.5 text-sm font-semibold text-[var(--text-main)] outline-none transition resize-y focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10"
        />
    </label>
);

const Toggle = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 cursor-pointer">
        <span className="text-sm font-black text-[var(--text-main)]">{label}</span>
        <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 accent-emerald-600" />
    </label>
);

const HomepageBuilder = () => {
    const [config, setConfig] = useState(defaultHomepageConfig);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const selectedCourses = useMemo(() => new Set(config.showcase.selectedCourseIds || []), [config.showcase.selectedCourseIds]);

    useEffect(() => {
        const load = async () => {
            try {
                const [{ data: homepageData }, { data: coursesData }] = await Promise.all([
                    api.get('/setting/homepage'),
                    api.get('/course/all')
                ]);

                if (homepageData.success) {
                    setConfig(mergeHomepageConfig(homepageData.homepage));
                }
                if (coursesData.success) {
                    setCourses(coursesData.courses || []);
                }
            } catch (error) {
                toast.error('Failed to load homepage builder');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const patchSection = (section, key, value) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const patchArrayItem = (section, key, index, field, value) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: prev[section][key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
            }
        }));
    };

    const handleCourseToggle = (courseId) => {
        setConfig(prev => {
            const nextIds = selectedCourses.has(courseId)
                ? prev.showcase.selectedCourseIds.filter(id => id !== courseId)
                : [...prev.showcase.selectedCourseIds, courseId];

            return {
                ...prev,
                showcase: {
                    ...prev.showcase,
                    selectedCourseIds: nextIds
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const loadingToast = toast.loading('Saving homepage configuration...');
        try {
            const { data } = await api.patch('/setting/homepage', { homepage: config });
            if (data.success) {
                setConfig(mergeHomepageConfig(data.homepage));
                toast.update(loadingToast, { render: 'Homepage builder saved', type: 'success', isLoading: false, autoClose: 2500 });
            }
        } catch (error) {
            toast.update(loadingToast, { render: 'Failed to save homepage builder', type: 'error', isLoading: false, autoClose: 2500 });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading homepage builder...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border)] pb-8">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Admin Editable Homepage</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-main)]">Homepage Builder</h1>
                    <p className="mt-3 max-w-3xl text-sm font-medium text-[var(--text-muted)]">Control hero copy, homepage sections, testimonials, theme accents, and featured course selection without changing core LMS logic.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-14 px-8 rounded-2xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save Homepage'}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <SectionCard title="Hero" subtitle="Main message, CTAs, and metrics.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input label="Eyebrow" value={config.hero.eyebrow} onChange={(e) => patchSection('hero', 'eyebrow', e.target.value)} />
                            <Input label="Highlight" value={config.hero.highlight} onChange={(e) => patchSection('hero', 'highlight', e.target.value)} />
                            <div className="md:col-span-2">
                                <Input label="Title" value={config.hero.title} onChange={(e) => patchSection('hero', 'title', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <Textarea label="Subtitle" value={config.hero.subtitle} onChange={(e) => patchSection('hero', 'subtitle', e.target.value)} rows={4} />
                            </div>
                            <Input label="Primary CTA Label" value={config.hero.primaryCtaLabel} onChange={(e) => patchSection('hero', 'primaryCtaLabel', e.target.value)} />
                            <Input label="Primary CTA Link" value={config.hero.primaryCtaLink} onChange={(e) => patchSection('hero', 'primaryCtaLink', e.target.value)} />
                            <Input label="Secondary CTA Label" value={config.hero.secondaryCtaLabel} onChange={(e) => patchSection('hero', 'secondaryCtaLabel', e.target.value)} />
                            <Input label="Secondary CTA Link" value={config.hero.secondaryCtaLink} onChange={(e) => patchSection('hero', 'secondaryCtaLink', e.target.value)} />
                        </div>
                    </SectionCard>

                    <SectionCard title="Feature Cards" subtitle="Three fast-scanning value points on the homepage.">
                        <div className="space-y-5">
                            <Toggle label="Enable feature section" checked={config.features.enabled} onChange={(e) => patchSection('features', 'enabled', e.target.checked)} />
                            <Input label="Section Title" value={config.features.title} onChange={(e) => patchSection('features', 'title', e.target.value)} />
                            <Textarea label="Section Subtitle" value={config.features.subtitle} onChange={(e) => patchSection('features', 'subtitle', e.target.value)} rows={3} />
                            {config.features.cards.map((card, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                                    <Input label={`Card ${index + 1} Icon`} value={card.icon} onChange={(e) => patchArrayItem('features', 'cards', index, 'icon', e.target.value)} />
                                    <div className="md:col-span-2">
                                        <Input label={`Card ${index + 1} Title`} value={card.title} onChange={(e) => patchArrayItem('features', 'cards', index, 'title', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <Textarea label={`Card ${index + 1} Description`} value={card.description} onChange={(e) => patchArrayItem('features', 'cards', index, 'description', e.target.value)} rows={3} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Course Showcase" subtitle="Choose how the homepage highlights courses.">
                        <div className="space-y-5">
                            <Toggle label="Enable course showcase" checked={config.showcase.enabled} onChange={(e) => patchSection('showcase', 'enabled', e.target.checked)} />
                            <Input label="Showcase Title" value={config.showcase.title} onChange={(e) => patchSection('showcase', 'title', e.target.value)} />
                            <Textarea label="Showcase Subtitle" value={config.showcase.subtitle} onChange={(e) => patchSection('showcase', 'subtitle', e.target.value)} rows={3} />
                            <label className="block space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Showcase Mode</span>
                                <select
                                    value={config.showcase.mode}
                                    onChange={(e) => patchSection('showcase', 'mode', e.target.value)}
                                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-3.5 text-sm font-semibold text-[var(--text-main)] outline-none transition focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="trending">Trending</option>
                                    <option value="newest">Newest</option>
                                    <option value="selected">Selected</option>
                                </select>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                                {courses.map((course) => (
                                    <label key={course._id} className="flex items-start gap-3 rounded-2xl border border-transparent bg-white px-4 py-4 cursor-pointer hover:border-emerald-500/20">
                                        <input type="checkbox" checked={selectedCourses.has(course._id)} onChange={() => handleCourseToggle(course._id)} className="mt-1 h-4 w-4 accent-emerald-600" />
                                        <div>
                                            <p className="text-sm font-black text-[var(--text-main)]">{course.courseTitle}</p>
                                            <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{course.educator?.name || course.instructor?.name || 'Instructor'}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Testimonials" subtitle="Admin-managed trust and social proof.">
                        <div className="space-y-5">
                            <Toggle label="Enable testimonials section" checked={config.testimonials.enabled} onChange={(e) => patchSection('testimonials', 'enabled', e.target.checked)} />
                            <Input label="Testimonials Title" value={config.testimonials.title} onChange={(e) => patchSection('testimonials', 'title', e.target.value)} />
                            <Textarea label="Testimonials Subtitle" value={config.testimonials.subtitle} onChange={(e) => patchSection('testimonials', 'subtitle', e.target.value)} rows={3} />
                            {config.testimonials.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                                    <Input label="Name" value={item.name} onChange={(e) => patchArrayItem('testimonials', 'items', index, 'name', e.target.value)} />
                                    <Input label="Role" value={item.role} onChange={(e) => patchArrayItem('testimonials', 'items', index, 'role', e.target.value)} />
                                    <Input label="Image URL" value={item.image} onChange={(e) => patchArrayItem('testimonials', 'items', index, 'image', e.target.value)} />
                                    <Input label="Rating" value={String(item.rating)} onChange={(e) => patchArrayItem('testimonials', 'items', index, 'rating', Number(e.target.value) || 0)} />
                                    <div className="md:col-span-2">
                                        <Textarea label="Feedback" value={item.feedback} onChange={(e) => patchArrayItem('testimonials', 'items', index, 'feedback', e.target.value)} rows={3} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-8">
                    <SectionCard title="Theme" subtitle="Control homepage accent colors.">
                        <div className="space-y-5">
                            <Input label="Primary Color" value={config.theme.primary} onChange={(e) => patchSection('theme', 'primary', e.target.value)} placeholder="#0f766e" />
                            <Input label="Primary Hover" value={config.theme.primaryHover} onChange={(e) => patchSection('theme', 'primaryHover', e.target.value)} placeholder="#115e59" />
                            <Input label="Accent Color" value={config.theme.accent} onChange={(e) => patchSection('theme', 'accent', e.target.value)} placeholder="#f59e0b" />
                            <Input label="Surface Tint" value={config.theme.surfaceTint} onChange={(e) => patchSection('theme', 'surfaceTint', e.target.value)} placeholder="#ecfeff" />
                        </div>
                    </SectionCard>

                    <SectionCard title="CTA Block" subtitle="Closing call to action near the bottom of the homepage.">
                        <div className="space-y-5">
                            <Toggle label="Enable CTA section" checked={config.cta.enabled} onChange={(e) => patchSection('cta', 'enabled', e.target.checked)} />
                            <Input label="CTA Title" value={config.cta.title} onChange={(e) => patchSection('cta', 'title', e.target.value)} />
                            <Textarea label="CTA Subtitle" value={config.cta.subtitle} onChange={(e) => patchSection('cta', 'subtitle', e.target.value)} rows={4} />
                            <Input label="Primary CTA Label" value={config.cta.primaryCtaLabel} onChange={(e) => patchSection('cta', 'primaryCtaLabel', e.target.value)} />
                            <Input label="Primary CTA Link" value={config.cta.primaryCtaLink} onChange={(e) => patchSection('cta', 'primaryCtaLink', e.target.value)} />
                            <Input label="Secondary CTA Label" value={config.cta.secondaryCtaLabel} onChange={(e) => patchSection('cta', 'secondaryCtaLabel', e.target.value)} />
                            <Input label="Secondary CTA Link" value={config.cta.secondaryCtaLink} onChange={(e) => patchSection('cta', 'secondaryCtaLink', e.target.value)} />
                            {config.cta.bullets.map((bullet, index) => (
                                <Input key={index} label={`Bullet ${index + 1}`} value={bullet} onChange={(e) => {
                                    setConfig(prev => ({
                                        ...prev,
                                        cta: {
                                            ...prev.cta,
                                            bullets: prev.cta.bullets.map((item, itemIndex) => itemIndex === index ? e.target.value : item)
                                        }
                                    }));
                                }} />
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Preview Rules" subtitle="How the homepage behaves if config is incomplete.">
                        <ul className="space-y-3 text-sm font-medium text-[var(--text-muted)]">
                            <li>Empty config automatically falls back to sensible default content.</li>
                            <li>Course showcase supports featured, trending, newest, or selected courses.</li>
                            <li>Theme values are applied only to the homepage so existing panel logic stays safe.</li>
                        </ul>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default HomepageBuilder;


