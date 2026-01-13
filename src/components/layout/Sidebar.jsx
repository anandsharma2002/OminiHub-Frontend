import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaProjectDiagram, FaTasks, FaBook, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Overview', icon: <FaHome /> },
        { path: '/projects', label: 'Projects', icon: <FaProjectDiagram /> },
        { path: '/tasks', label: 'My Tasks', icon: <FaTasks /> },
        { path: '/docs', label: 'Documentation', icon: <FaBook /> },
        { path: '/settings', label: 'Settings', icon: <FaCog /> },
    ];

    return (
        <aside className={`h-screen sticky top-0 transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 ${collapsed ? 'w-20' : 'w-64'}`}>

            {/* Header */}
            <div className="h-[var(--nav-height)] flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                {!collapsed && (
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                        OmniHub
                    </span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 flex flex-col space-y-1 px-3">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center px-3 py-3 rounded-lg transition-all duration-200 font-medium group
                            ${isActive
                                ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }
                        `}
                    >
                        <span className="text-xl">{item.icon}</span>
                        {!collapsed && <span className="ml-3">{item.label}</span>}

                        {/* Tooltip for collapsed mode */}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
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
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    <FaSignOutAlt />
                    {!collapsed && <span className="ml-3 font-medium">Log Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
