import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import projectAPI from '../api/project';
import CircularProgressBar from '../components/CircularProgressBar';
import { useSocket } from '../context/SocketContext';
import { FaChartPie, FaTasks, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const ProgressDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchProgress = async () => {
        try {
            const res = await projectAPI.getProjectsProgress();
            setProjects(res.data);
        } catch (error) {
            console.error("Failed to fetch progress", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshProject = useCallback(async (projectId) => {
        try {
            const res = await projectAPI.getProjectProgress(projectId);
            setProjects(prev => prev.map(p => p._id === projectId ? res.data : p));
        } catch (error) {
            console.error("Failed to refresh project progress", error);
        }
    }, []);

    useEffect(() => {
        fetchProgress();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listeners for functionality that affects progress
        const handleUpdate = (data) => {
            // Data might be the object itself (with .project field) or an envelope { projectId: ... }
            const pid = data.project || data.projectId || (data.task && data.task.project);
            if (pid) refreshProject(pid);
        };

        const handleDelete = (data) => {
            // data can be ID (string) or object { taskId, projectId }
            // If string, we don't know project easily unless we map it. 
            // But backend emits { taskId, projectId } for deletions usually now from my review.
            const pid = data.projectId || data.project;
            if (pid) refreshProject(pid);
        };

        // Task Events
        socket.on('task_created', handleUpdate);
        socket.on('task_updated', handleUpdate);
        socket.on('task_deleted', handleDelete);

        // Ticket Events
        socket.on('ticket_created', handleUpdate);
        socket.on('ticket_updated', handleUpdate);
        socket.on('ticket_deleted', handleDelete);

        // Column Events (Weights change)
        socket.on('column_created', handleUpdate);
        socket.on('column_deleted', handleDelete);
        socket.on('columns_reordered', handleUpdate); // { projectId, columns }

        return () => {
            socket.off('task_created', handleUpdate);
            socket.off('task_updated', handleUpdate);
            socket.off('task_deleted', handleDelete);
            socket.off('ticket_created', handleUpdate);
            socket.off('ticket_updated', handleUpdate);
            socket.off('ticket_deleted', handleDelete);
            socket.off('column_created', handleUpdate);
            socket.off('column_deleted', handleDelete);
            socket.off('columns_reordered', handleUpdate);
        };
    }, [socket, refreshProject]);

    if (loading) {
        return (
            <div className="page-container flex justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="mb-8 mt-5 md:mt-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <FaChartPie className="text-violet-600" />
                    Project Progress
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Overview of all your projects and their completion status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Link
                        to={`/projects/${project._id}/progress`}
                        key={project._id}
                        className="card-glass p-6 group hover:border-violet-500/50 transition-all hover:shadow-lg hover:-translate-y-1 block h-full"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {project.stats?.total || 0} Total Tasks
                                </p>
                            </div>
                            <div className="bg-violet-50 dark:bg-violet-900/20 px-3 py-1 rounded-full text-xs font-medium text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800">
                                {project.projectType}
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <CircularProgressBar
                                progress={project.progress || 0}
                                size={140}
                                progressColor={project.progress === 100 ? "text-emerald-500" : "text-violet-600"}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                                <div className="text-slate-400 mb-1 flex justify-center"><FaTasks /></div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{project.stats?.pending || 0}</span>
                                <div className="text-[10px] text-slate-500">Pending</div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-2">
                                <div className="text-emerald-500 mb-1 flex justify-center"><FaCheckCircle /></div>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400">{project.stats?.completed || 0}</span>
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-500">Done</div>
                            </div>
                            <div className="bg-violet-50 dark:bg-violet-900/10 rounded-lg p-2">
                                <div className="text-violet-500 mb-1 flex justify-center"><FaChartPie /></div>
                                <span className="font-bold text-violet-700 dark:text-violet-400">{project.stats?.total || 0}</span>
                                <div className="text-[10px] text-violet-600 dark:text-violet-500">Total</div>
                            </div>
                        </div>
                    </Link>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <FaChartPie className="mx-auto text-4xl mb-4 opacity-50" />
                        <p className="text-lg font-medium">No projects found</p>
                        <p className="mb-6">Create a project to track progress.</p>
                        <Link
                            to="/projects"
                            className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                        >
                            Go to Projects
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressDashboard;
