import React from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/layout/Sidebar';
import { FaProjectDiagram, FaCheckCircle, FaClock, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617]">
            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.username}!</p>
                    </div>

                    <button className="btn-primary flex items-center space-x-2">
                        <FaPlus /> <span>New Project</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Active Projects"
                        value="12"
                        trend="+2 this week"
                        icon={<FaProjectDiagram />}
                        color="bg-violet-500"
                    />
                    <StatCard
                        title="Tasks Completed"
                        value="84%"
                        trend="+5% vs last week"
                        icon={<FaCheckCircle />}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Hours Spent"
                        value="32h"
                        trend="On track"
                        icon={<FaClock />}
                        color="bg-amber-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div className="card-glass p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Projects</h3>
                        <div className="space-y-4">
                            <ProjectItem name="OmniHub Redesign" status="In Progress" color="bg-violet-500" />
                            <ProjectItem name="API Gateway" status="Review" color="bg-amber-500" />
                            <ProjectItem name="Mobile App" status="Planning" color="bg-slate-500" />
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="card-glass p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Profile</h3>
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-600">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-medium text-lg">{user?.email}</p>
                                <p className="text-slate-500 text-sm">Role: {user?.role || 'User'}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500">Member ID</p>
                            <p className="font-mono text-slate-700 dark:text-slate-300 truncate">{user?._id}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ title, value, trend, icon, color }) => (
    <div className="card-glass p-6 flex items-start justify-between hover:-translate-y-1 transition-transform duration-300">
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
            <p className={`text-xs mt-2 font-medium ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-500'}`}>
                {trend}
            </p>
        </div>
        <div className={`p-3 rounded-xl text-white shadow-lg ${color}`}>
            {icon}
        </div>
    </div>
);

const ProjectItem = ({ name, status, color }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
        <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="font-medium text-slate-700 dark:text-slate-200">{name}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {status}
        </span>
    </div>
);

export default Dashboard;
