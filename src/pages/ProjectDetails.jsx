import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import projectAPI from '../api/project';
import TaskListComponent from '../components/project/TaskListComponent';
import KanbanBoardComponent from '../components/project/KanbanBoardComponent';
import ContributorsComponent from '../components/project/ContributorsComponent';
import { FaArrowLeft, FaCog, FaUsers } from 'react-icons/fa';

import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useSocket();
    const { success, error: toastError } = useToast();
    const { showConfirm } = useConfirm();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks'); // tasks, board, settings

    // Update Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        projectType: 'Web App'
    });
    const [updateLoading, setUpdateLoading] = useState(false);

    const isOwner = project && user && project.owner?._id === user._id;

    const fetchProject = async () => {
        try {
            const res = await projectAPI.getProject(id);
            setProject(res.data);
            setFormData({
                name: res.data.name || '',
                description: res.data.description || '',
                projectType: res.data.projectType || 'Web App'
            });
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
    // Real-time Room Joining
    useEffect(() => {
        if (!socket || !id) return;

        const roomName = `project_${id}`;
        socket.emit('join_entity', roomName);

        const handleConnect = () => {
            console.log("Re-joining project room:", roomName);
            socket.emit('join_entity', roomName);
        };

        const handleProjectUpdated = (updatedProject) => {
            if (updatedProject._id === id) {
                setProject(prev => ({ ...prev, ...updatedProject }));
            }
        };

        const handleProjectDeleted = ({ projectId }) => {
            if (projectId === id) {
                success('Project was deleted');
                navigate('/projects');
            }
        };

        socket.on('connect', handleConnect);
        socket.on('project_updated', handleProjectUpdated);
        socket.on('project_deleted', handleProjectDeleted);

        return () => {
            socket.emit('leave_entity', roomName);
            socket.off('connect', handleConnect);
            socket.off('project_updated', handleProjectUpdated);
            socket.off('project_deleted', handleProjectDeleted);
        };
    }, [socket, id, navigate, success]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const res = await projectAPI.updateProject(id, formData);
            setProject(res.data);
            success('Project updated');
        } catch (error) {
            console.error("Failed to update project", error);
            toastError("Failed to update project");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async () => {
        const isConfirmed = await showConfirm("Are you sure you want to delete this project? This action cannot be undone.", "Delete Project", "danger");
        if (!isConfirmed) return;

        try {
            await projectAPI.deleteProject(id);
            navigate('/projects');
            success('Project deleted');
        } catch (error) {
            console.error("Failed to delete project", error);
            toastError("Failed to delete project");
        }
    };

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
                    <div className="h-full overflow-auto p-6 max-w-4xl mx-auto space-y-8 pb-20 scrollbar-hide">
                        {/* Contributors Management */}
                        <section>
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Collaborators</h2>
                            <ContributorsComponent project={project} onUpdate={fetchProject} />
                        </section>

                        {/* Project Management - Owner Only */}
                        {isOwner && (
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                                <h2 className="text-xl font-bold mb-4 dark:text-white">Project Settings</h2>

                                {/* Update Form */}
                                <div className="card p-6 mb-8">
                                    <h3 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">General Information</h3>
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input-field w-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="input-field w-full"
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Type</label>
                                            <select
                                                value={formData.projectType}
                                                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                                className="input-field w-full"
                                            >
                                                <option value="Web App">Web App</option>
                                                <option value="Mobile App">Mobile App</option>
                                                <option value="Desktop App">Desktop App</option>
                                                <option value="Marketing Site">Marketing Site</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" disabled={updateLoading} className="btn-primary">
                                                {updateLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Danger Zone */}
                                <div className="card border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-6">
                                    <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Once you delete a project, there is no going back. Please be certain.</p>
                                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                                        Delete Project
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
