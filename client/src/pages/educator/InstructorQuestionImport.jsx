import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import api from '@/utils/api';
import { toast } from 'react-toastify';

const InstructorQuestionImport = () => {
    const { groups: contextGroups } = useContext(AppContext);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await api.get('/education/question-group/all');
                if (data.success) setGroups(data.groups);
            } catch (error) {
                toast.error('Failed to fetch question groups');
            }
        };
        fetchGroups();
    }, []);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!selectedGroup || !file) {
            return toast.warn('Select Group and File first');
        }
        
        const actionToast = toast.loading('Processing Bulk Import...');
        try {
            const formData = new FormData();
            formData.append('group', selectedGroup);
            formData.append('file', file);
            
            const { data } = await api.post('/education/question-import', formData);
            
            if (data.success) {
                toast.update(actionToast, { render: 'Bulk synchronization completed successfully.', type: "success", isLoading: false, autoClose: 3000 });
                setFile(null);
            }
        } catch (error) {
            toast.update(actionToast, { render: 'Bulk synchronization failure.', type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const downloadSample = () => {
        const csvContent = "question,option1,option2,option3,option4,correctAnswerIndex,marks,type\nWhat is PHP?,Personal Home Page,Pretext Hypertext Processor,Private Home Page,PHP: Hypertext Preprocessor,3,1,M";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'question_import_sample.csv';
        a.click();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">Question Import</h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Dashboard | Education | Quiz | Question Import</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-12 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-10">
                    <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Bulk Import</h2>
                    <button 
                        onClick={downloadSample}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        + Sample Download
                    </button>
                </div>

                {/* Instructions */}
                <div className="bg-[var(--background)]/50 rounded-2xl p-8 mb-10 border border-[var(--border)]">
                    <div className="space-y-4">
                        <p className="text-xs font-bold text-gray-500 leading-relaxed italic">01. You need to import Excel/CSV File. For sample you can download by clicking Sample Download</p>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed italic">02. Make sure input correct answer in right column. Use option index (0, 1, 2, 3).</p>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed italic">03. Option is now dynamic. Max 4 options supported in bulk import currently.</p>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed italic">04. Use Type M= Multiple Choice; S=Short Answer; L=Long Answer (In type column)</p>
                    </div>
                </div>

                <form onSubmit={handleImport} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Group *</label>
                        <select 
                            className="w-full px-6 py-4 border border-[var(--border)] rounded-xl bg-[var(--background)]/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-[var(--surface)] transition-all font-bold text-[var(--text-main)] text-sm appearance-none"
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            required
                        >
                            <option value="">Select Group</option>
                            {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Excel File *</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 border-2 border-dashed border-[var(--border)] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all bg-[var(--background)]/30">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{file ? file.name : 'Browse Excel/CSV File'}</span>
                                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} required />
                                <span className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase">Browse</span>
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <button type="submit" className="w-fit px-12 h-14 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/10 transition-all">
                            Bulk Import
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorQuestionImport;




