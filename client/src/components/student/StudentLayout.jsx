import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';

const StudentLayout = () => {
    const location = useLocation();
    const isPlayerPage = location.pathname.includes('/player/');

    return (
        <div className={`flex min-h-screen bg-[var(--background)] student-theme animate-fade-in overflow-hidden relative ${isPlayerPage ? 'player-view' : ''}`}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[var(--accent)]/10 blur-[100px]" />
                <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-[100px]" />
            </div>
            
            {!isPlayerPage && <StudentSidebar />}
            
            <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
                {!isPlayerPage && <StudentNavbar />}
                <main className={`${isPlayerPage ? 'p-0' : 'p-6 md:p-10'} flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
