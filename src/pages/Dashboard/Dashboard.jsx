import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaProjectDiagram, FaCheckCircle, FaClock, FaPlus, FaBars, FaFire, FaFileAlt } from 'react-icons/fa';
import api from '../../api/axios';
import TaskListWidget from '../../components/dashboard/TaskListWidget';

const Dashboard = () => {
    const { user } = useAuth();
    const { setSidebarOpen } = useOutletContext();

    const [stats, setStats] = useState({
        activeProjects: 0,
        pendingTasks: 0,
        completionRate: 0,
        streak: 0,
        totalDocs: 0,
        maxStreak: 0
    });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all data in parallel
                const [statsRes, tasksRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/tasks')
                ]);

                setStats(statsRes.data.data);
                setTasks(tasksRes.data.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 w-full flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 w-full animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                <div className="flex items-center w-full md:w-auto mt-10">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.firstName || user?.username}!</p>
                    </div>
                </div>


            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Current Streak"
                    value={stats.streak}
                    trend={`Max Streak: ${stats.maxStreak || 0}`}
                    icon={<FaFire />}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Active Projects"
                    value={stats.activeProjects}
                    trend="Projects joined"
                    icon={<FaProjectDiagram />}
                    color="bg-violet-500"
                />
                <StatCard
                    title="Pending Tasks"
                    value={stats.pendingTasks}
                    trend={`${stats.completionRate}% completion rate`}
                    icon={<FaCheckCircle />}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="My Documents"
                    value={stats.totalDocs}
                    trend="Private & Public"
                    icon={<FaFileAlt />}
                    color="bg-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Priority Tasks */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card-glass p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Priority Tasks</h3>
                            <Link to="/projects" className="text-sm text-violet-600 hover:text-violet-700 font-medium">View Board</Link>
                        </div>
                        <TaskListWidget tasks={tasks} />
                    </div>
                </div>

                {/* Right Column: Profile & Activity */}
                <div className="space-y-8">
                    {/* Profile Card */}
                    <div className="card-glass p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            {user?.profile?.image && user.profile.image !== 'default.jpg' ? (
                                <img
                                    src={user.profile.image}
                                    alt={user.username}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-violet-100"
                                />
                            ) : (
                                <div className="shrink-0 w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-600">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-slate-900 dark:text-white font-medium text-lg truncate" title={user?.username}>
                                    @{user?.username}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Quick Actions</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <Link to="/documents" className="p-2 text-center rounded bg-white dark:bg-slate-700 dark:text-slate-300 text-slate-600 text-sm hover:text-violet-600 shadow-sm border border-slate-100 dark:border-slate-600">
                                    My Docs
                                </Link>
                                <Link to="/settings" className="p-2 text-center rounded bg-white dark:bg-slate-700 dark:text-slate-300 text-slate-600 text-sm hover:text-violet-600 shadow-sm border border-slate-100 dark:border-slate-600">
                                    Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, trend, icon, color }) => (
    <div className="card-glass p-6 flex items-start justify-between hover:-translate-y-1 transition-transform duration-300">
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
            <p className="text-xs mt-2 font-medium text-slate-500">
                {trend}
            </p>
        </div>
        <div className={`p-3 rounded-xl text-white shadow-lg ${color}`}>
            {icon}
        </div>
    </div>
);

const ProjectItem = ({ project }) => (
    <Link to={`/projects/${project._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group">
        <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: project.color || '#8b5cf6' }}></div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-violet-600 transition-colors">{project.name}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
            {project.status}
        </span>
    </Link>
);

export default Dashboard;
