import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';

const StudentLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <StudentSidebar />
            <div className="flex-1 flex flex-col relative">
                <StudentNavbar />
                <main className="p-10 flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
