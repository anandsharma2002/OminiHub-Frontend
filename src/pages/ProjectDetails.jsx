import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectAPI from '../api/project';
import TaskListComponent from '../components/project/TaskListComponent';
import KanbanBoardComponent from '../components/project/KanbanBoardComponent';
import ContributorsComponent from '../components/project/ContributorsComponent';
import { FaArrowLeft, FaCog, FaUsers } from 'react-icons/fa';

import { useSocket } from '../context/SocketContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const { socket } = useSocket();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks'); // tasks, board, settings

    const fetchProject = async () => {
        try {
            const res = await projectAPI.getProject(id);
            setProject(res.data);
        } catch (error) {
            console.error("Failed to fetch project", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    // Real-time Room Joining
    useEffect(() => {
        if (!socket || !id) return;

        const roomName = `project_${id}`;
        socket.emit('join_entity', roomName);

        const handleConnect = () => {
            console.log("Re-joining project room:", roomName);
            socket.emit('join_entity', roomName);
        };

        socket.on('connect', handleConnect);

        return () => {
            socket.emit('leave_entity', roomName);
            socket.off('connect', handleConnect);
        };
    }, [socket, id]);

    if (loading) return <div className="page-container flex justify-center pt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div></div>;
    if (!project) return <div className="page-container text-center pt-20">Project not found</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-var(--nav-height))] overflow-hidden bg-slate-50 dark:bg-[#020617]">
            {/* Header */}
            <div className="w-full relative z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-4">
                    <Link to="/projects" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                            {project.name}
                            <span className="ml-3 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-700">
                                {project.projectType || 'Project'}
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">{project.description}</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {['tasks', 'board', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2 overflow-hidden">
                        <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 leading-none">
                            {project.owner?.username?.[0]?.toUpperCase()}
                        </div>
                        {project.contributors?.map((c, i) => (
                            <div key={c.user?._id || i} className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 leading-none" title={c.user?.username}>
                                {c.user?.username?.[0]?.toUpperCase()}
                            </div>
                        ))}
                    </div>

                    <button className="text-slate-400 hover:text-violet-600 transition-colors">
                        <FaCog />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-hidden relative">
                {activeTab === 'tasks' && (
                    <div className="h-full overflow-auto p-6">
                        <TaskListComponent projectId={id} />
                    </div>
                )}

                {activeTab === 'board' && (
                    <div className="h-full overflow-hidden p-6 bg-slate-100/50 dark:bg-slate-900/50">
                        <KanbanBoardComponent projectId={id} />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="h-full overflow-auto p-6 max-w-4xl mx-auto">
                        <ContributorsComponent project={project} onUpdate={fetchProject} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
