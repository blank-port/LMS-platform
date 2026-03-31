import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  PencilSquareIcon, 
  VariableIcon, 
  EyeIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const EmailTemplate = () => {
  const [activeTemplate, setActiveTemplate] = useState('enrollment');

  const templates = [
    { id: 'enrollment', name: 'Course Enrollment Success', group: 'Academy' },
    { id: 'publish', name: 'Course Publish Notification', group: 'Academy' },
    { id: 'lesson', name: 'New Lesson Notification', group: 'Academy' },
    { id: 'payment', name: 'Payment Approval', group: 'Finance' },
    { id: 'payout', name: 'Instructor Payout Approval', group: 'Finance' },
    { id: 'refund', name: 'Refund Success', group: 'Finance' },
  ];

  const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-[var(--surface)] rounded-[2rem] shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-4">
        <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center text-purple-400 shadow-sm border border-purple-800/30">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-main)]">{title}</h3>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--surface)] p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 text-2xl shadow-inner">
             📝
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Email Templates</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Administration / Automation Messaging</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-[var(--background)] hover:bg-[var(--background)] text-[var(--text-muted)] rounded-2xl font-bold transition-all active:scale-95">
            <EyeIcon className="w-5 h-5" />
            Live Preview
          </button>
          <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95">
            <CheckCircleIcon className="w-5 h-5" />
            Deploy Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Template List */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-6 flex flex-col gap-4 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Available Triggers</span>
            <div className="flex flex-col gap-1">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`flex flex-col items-start p-4 rounded-xl transition-all ${
                    activeTemplate === t.id 
                    ? 'bg-purple-900/20 text-purple-700' 
                    : 'hover:bg-[var(--background)] text-[var(--text-muted)]'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-tighter opacity-50 mb-1">{t.group}</span>
                  <span className="text-sm font-bold">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <Card title="Strategic Template Editor" icon={PencilSquareIcon}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Subject</label>
                <input 
                  type="text" 
                  defaultValue="Victory! You've enrolled in {course_name}"
                  className="w-full px-5 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Template Content (HTML Support)</label>
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/20 text-purple-400 rounded-full text-[10px] font-black">
                    <VariableIcon className="w-3.5 h-3.5" />
                    Shortcodes Active
                  </div>
                </div>
                <textarea 
                  rows={15}
                  className="w-full px-6 py-6 rounded-3xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-mono text-sm bg-[var(--background)]/50"
                  defaultValue={`<div style="font-family: sans-serif; padding: 40px; background: #fdfdff;">
  <h1 style="color: #9333ea; font-size: 32px; font-weight: 800;">Welcome Aboard, {user_name}!</h1>
  <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">Your journey into <strong>{course_name}</strong> has officially begun.</p>
  <div style="margin-top: 32px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: white;">
    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1f2937;">Transaction Reference:</p>
    <code style="display: block; margin-top: 8px; font-size: 12px; color: #9333ea;">{order_id}</code>
  </div>
</div>`}
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['{user_name}', '{course_name}', '{order_id}', '{instructor_name}', '{enroll_date}', '{transaction_amount}'].map(tag => (
                  <button key={tag} className="px-3 py-1.5 bg-[var(--background)] hover:bg-[var(--surface)] hover:border-purple-200 border border-transparent rounded-lg text-[10px] font-bold text-gray-500 transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;
