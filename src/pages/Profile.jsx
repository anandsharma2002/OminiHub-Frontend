import React from 'react';
import useAuth from '../hooks/useAuth';
import { FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt, FaEdit, FaCamera } from 'react-icons/fa';

const Profile = () => {
    const { user } = useAuth();

    // Mock join date if not available in user object
    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'January 2024';

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    My Profile
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    View and manage your personal information.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="card-glass p-8 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 dark:opacity-40"></div>

                        <div className="relative z-10 mb-4 group cursor-pointer">
                            <div className="w-32 h-32 rounded-full bg-violet-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-5xl font-bold text-violet-600 dark:text-violet-400 overflow-hidden">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <FaCamera className="text-white text-2xl" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {user?.username}
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-sm font-medium mb-6">
                            {user?.role || 'User'}
                        </span>

                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <FaEnvelope className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">Email Address</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate" title={user?.email}>
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <FaIdBadge className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">User ID</p>
                                    <p className="text-sm font-mono text-slate-900 dark:text-slate-200 truncate">
                                        {user?._id}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <FaCalendarAlt className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">Joined</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                        {joinDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button className="mt-8 btn-primary w-full flex items-center justify-center space-x-2">
                            <FaEdit />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>

                {/* Activity / Stats Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="card p-6 border-l-4 border-violet-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Projects</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">12</p>
                            <p className="text-sm text-emerald-500 mt-1 font-medium">+2 this month</p>
                        </div>
                        <div className="card p-6 border-l-4 border-indigo-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Documents</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">48</p>
                            <p className="text-sm text-emerald-500 mt-1 font-medium">+15 this month</p>
                        </div>
                    </div>

                    <div className="card-glass p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Account Overview</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                            Welcome to your profile dashboard. Here you can view your personal information, track your activity stats, and manage your account settings.
                        </p>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Completion Status</h4>
                            <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-2.5 mb-2">
                                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-500">Your profile is 85% complete. Add a phone number to reach 100%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
