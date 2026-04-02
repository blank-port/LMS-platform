import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';

const StudentLayout = () => {
    return (
        <div className="flex min-h-screen bg-[var(--background)] student-theme animate-fade-in overflow-hidden">
            <StudentSidebar />
            <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
                <StudentNavbar />
                <main className="p-10 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
