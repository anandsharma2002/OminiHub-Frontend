import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
import { FaMoon, FaSun, FaPalette, FaUser, FaBell, FaShieldAlt } from 'react-icons/fa';

const Settings = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your account preferences and application, settings.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Navigation for Settings (Visual only for now) */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="card p-4 space-y-1">
                        <button className="w-full flex items-center space-x-3 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-xl font-medium transition-colors">
                            <FaPalette />
                            <span>Appearance</span>
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                        >
                            <FaUser />
                            <span>Profile</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                            <FaBell />
                            <span>Notifications</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                            <FaShieldAlt />
                            <span>Security</span>
                        </button>
                    </div>
                </div>

                {/* Main Settings Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Appearance Section */}
                    <div className="card-glass p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
                                <FaPalette size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Customize the look and feel of the application.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                        <FaMoon />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white">Dark Mode</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between light and dark themes.</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ThemeToggle />
                                    <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Switch Theme
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
