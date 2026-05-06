import React, { useState } from 'react';
import { X, Upload, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/utils/api';

const AssignmentSubmissionModal = ({ isOpen, onClose, assignment, onSubmissionSuccess }) => {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content && files.length === 0) {
            toast.error('Material response or structural assets required');
            return;
        }

        setIsSubmitting(true);
        const actionToast = toast.loading('Synchronizing Submission Matrix...');

        try {
            const formData = new FormData();
            formData.append('assignmentId', assignment._id);
            formData.append('content', content);
            
            files.forEach(file => {
                formData.append('files', file);
            });

            const { data } = await api.post('/assignment/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.update(actionToast, { 
                    render: 'Institutional submission verified.', 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                onSubmissionSuccess(data.submission);
                onClose();
            }
        } catch (error) {
            toast.update(actionToast, { 
                render: 'Submission synchronization failure.', 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0C132B]/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[var(--surface)] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-indigo-600/10 to-transparent">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] leading-none">Submission Nexus</p>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight uppercase">Commit Response</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500/20 hover:text-rose-500 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Assignment Brief */}
                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-500/10">
                        <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <FileText size={14} /> Briefing: {assignment?.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-bold">{assignment?.description}</p>
                    </div>

                    {/* Content Input */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Cognitive Synthesis (Text Response)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Synthesize your academic findings here..."
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[2rem] p-8 text-sm text-[var(--text-main)] outline-none focus:border-indigo-500/50 transition-all min-h-[200px] resize-none leading-relaxed placeholder:text-[var(--text-muted)]/20"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Structural Assets (Files)</label>
                        <div className="grid grid-cols-1 gap-4">
                            <label className="cursor-pointer group">
                                <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                <div className="border-2 border-dashed border-[var(--border)] rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Integrate External Nodes</p>
                                    <p className="text-[9px] text-[var(--text-muted)] opacity-50 mt-2 uppercase font-bold tracking-tighter">PDF, ZIP, DOCX supported</p>
                                </div>
                            </label>

                            {files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/file">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[var(--text-main)] truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-tighter">Verified Stream</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => removeFile(idx)}
                                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500/20 hover:text-rose-500 opacity-0 group-hover/file:opacity-100 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-[var(--border)] flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] hover:bg-white/5 transition-all"
                    >
                        Abort Protocol
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Send size={14} /> Commit Submission
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentSubmissionModal;


