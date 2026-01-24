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
        <div className="flex min-h-[calc(100vh-var(--nav-height))] bg-slate-50 dark:bg-[#020617]">
            {/* Shared Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 relative overflow-hidden">
                {/* Mobile Sidebar Toggle - Positioned absolutely to avoid layout shift, 
                    pages should account for this or implement their own trigger using context */}
                <div className="md:hidden absolute top-4 left-4 z-20">
                    <button
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-violet-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-lg shadow-sm"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FaBars size={20} />
                    </button>
                </div>

                <Outlet context={{ isSidebarOpen, setSidebarOpen }} />

                {/* AI Chat Integration */}
                <AIChatButton onClick={() => setAIChatOpen(prev => !prev)} />
                <AIChatWindow isOpen={isAIChatOpen} onClose={() => setAIChatOpen(false)} />
            </main>
        </div>
    );
};

export default DashboardLayout;
