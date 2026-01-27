import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { FaUserFriends, FaProjectDiagram, FaFileAlt, FaSignal, FaSync } from 'react-icons/fa';

const AdminPanel = () => {
    const { socket } = useSocket();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalProjects: 0,
        totalDocuments: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleActiveUsers = (data) => {
            setStats(prev => ({ ...prev, activeUsers: data.count }));
        };

        const handleStatsUpdate = () => {
            fetchStats();
        };

        socket.on('active_users_update', handleActiveUsers);
        socket.on('admin_stats_update', handleStatsUpdate);

        return () => {
            socket.off('active_users_update', handleActiveUsers);
            socket.off('admin_stats_update', handleStatsUpdate);
        };
    }, [socket]);

    const StatCard = ({ title, value, icon, color, subtext }) => (
        <div className="card-glass p-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
                    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
                </div>
                <div className={`p-4 rounded-xl text-white shadow-lg ${color} bg-opacity-90`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 w-full flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 w-full animate-fade-in max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time system overview</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Live Updates Active</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={<FaSignal />}
                    color="bg-emerald-500"
                    subtext="Currently connected"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<FaUserFriends />}
                    color="bg-violet-500"
                    subtext="Registered accounts"
                />
                <StatCard
                    title="Total Projects"
                    value={stats.totalProjects}
                    icon={<FaProjectDiagram />}
                    color="bg-blue-500"
                    subtext="Across all teams"
                />
                <StatCard
                    title="Total Documents"
                    value={stats.totalDocuments}
                    icon={<FaFileAlt />}
                    color="bg-orange-500"
                    subtext="Uploaded files"
                />
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <FaSync className="text-2xl animate-spin-slow" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">System Status</h3>
                        <p className="opacity-90">All systems operational. WebSocket connection stable.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
