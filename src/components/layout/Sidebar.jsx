import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaProjectDiagram, FaTasks, FaBook, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaTimes, FaGithub, FaBell, FaComments, FaChartPie } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';

const Sidebar = ({ isOpen, onClose }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { logout } = useAuth();
    const { unreadCount, chatUnreadCount } = useNotifications();
    const location = useLocation();

    // Sidebar is collapsed if neither locked nor hovered (Desktop only logic)
    const collapsed = !isLocked && !isHovered;

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/projects', label: 'Projects', icon: <FaProjectDiagram /> },
        { path: '/progress', label: 'Progress', icon: <FaChartPie /> },

        {
            path: '/notifications',
            label: 'Notifications',
            icon: <FaBell />,
            badge: unreadCount > 0 ? unreadCount : null
        },
        {
            path: '/chat',
            label: 'Chat',
            icon: <FaComments />,
            badge: chatUnreadCount > 0 ? chatUnreadCount : null
        },
        { path: '/docs', label: 'Documents', icon: <FaBook /> },
        { path: '/github', label: 'GitHub', icon: <FaGithub /> },
        { path: '/settings', label: 'Settings', icon: <FaCog /> }
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 md:sticky md:top-[var(--nav-height)] md:h-[calc(100vh-var(--nav-height))]
                    ${collapsed ? 'md:w-20' : 'md:w-64'}
                    w-64 shadow-2xl md:shadow-none
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >

                {/* Header */}
                <div className="h-[var(--nav-height)] flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                    {/* Mobile Close Button */}
                    <div className="md:hidden flex items-center justify-between w-full">
                        <span className="font-bold text-lg text-slate-800 dark:text-white">Menu</span>
                        <button onClick={onClose} className="text-slate-500 hover:text-red-500">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Desktop Lock Toggle */}
                    <div className="hidden md:flex w-full justify-end">
                        <button
                            onClick={() => setIsLocked(!isLocked)}
                            className={`p-1.5 rounded-lg transition-colors ${isLocked
                                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            title={isLocked ? "Unlock Sidebar (Auto-collapse)" : "Lock Sidebar Open"}
                        >
                            {isLocked ? <FaChevronLeft /> : <FaChevronRight />}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-6 flex flex-col space-y-1 px-3 sidebar-scroll">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose()} // Close drawer on navigation (mobile)
                            className={({ isActive }) => `
                                flex items-center px-3 py-3 rounded-lg transition-all duration-200 font-medium group
                                ${isActive
                                    ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }
                            `}
                        >
                            <span className="text-xl min-w-[20px] relative">
                                {item.icon}
                                {item.badge && collapsed && (
                                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </span>

                            {/* Mobile: Always Show Label. Desktop: Hide if collapsed */}
                            <span className={`ml-3 whitespace-nowrap flex-1 md:transition-opacity md:duration-200 ${collapsed ? 'md:opacity-0 md:hidden' : 'md:opacity-100'} flex items-center justify-between`}>
                                {item.label}
                                {item.badge && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </span>

                            {/* Tooltip for collapsed mode (Desktop Only) */}
                            {collapsed && (
                                <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={logout}
                        className={`flex items-center w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ${collapsed ? 'md:justify-center' : ''}`}
                    >
                        <FaSignOutAlt />
                        <span className={`ml-3 font-medium ${collapsed ? 'md:hidden' : ''}`}>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
