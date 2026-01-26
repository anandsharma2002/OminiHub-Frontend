import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';
import AIChatButton from '../ai/AIChatButton';
import AIChatWindow from '../ai/AIChatWindow';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isAIChatOpen, setAIChatOpen] = useState(false);

    return (
        <div className="flex min-h-[calc(100vh-var(--nav-height))] bg-slate-50 dark:bg-[#020617] relative">
            {/* Mobile Sidebar Toggle - Fixed position to ensure visibility during scroll */}
            <div className="md:hidden fixed top-18 left-4 z-50">
                <button
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-violet-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Toggle Sidebar"
                >
                    <FaBars size={20} />
                </button>
            </div>

            {/* Shared Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 relative overflow-hidden">

                <Outlet context={{ isSidebarOpen, setSidebarOpen }} />

                {/* AI Chat Integration */}
                <AIChatButton onClick={() => setAIChatOpen(prev => !prev)} />
                <AIChatWindow isOpen={isAIChatOpen} onClose={() => setAIChatOpen(false)} />
            </main>
        </div>
    );
};

export default DashboardLayout;
