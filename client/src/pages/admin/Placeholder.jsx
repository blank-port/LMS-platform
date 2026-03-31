import React from 'react'
import { useParams, useLocation } from 'react-router-dom'

const Placeholder = () => {
    const { id } = useParams();
    const location = useLocation();
    const pageName = location.pathname.split('/').pop().replace(/-/g, ' ');

    return (
        <div className="bg-[var(--surface)] p-8 rounded-xl shadow-sm border border-[var(--border)] min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-main)] capitalize mb-2">{pageName || 'Module'}</h2>
            <p className="text-gray-500 max-w-md">
                The {pageName} module is under construction as part of the LMS extension. 
                Backend APIs are ready, and this interface is being implemented.
            </p>
            <div className="mt-8 flex gap-4">
                <div className="px-4 py-2 bg-[var(--background)] rounded-lg text-xs font-mono text-[var(--text-muted)]">
                    Route: {location.pathname}
                </div>
            </div>
        </div>
    )
}

export default Placeholder
