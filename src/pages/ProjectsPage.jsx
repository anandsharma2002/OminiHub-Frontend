import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import projectAPI from '../api/project';
import { FaPlus, FaFolder, FaCodeBranch, FaUsers, FaArrowRight, FaSearch, FaTimes } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();
    const { socket } = useSocket();

    const location = useLocation();

    // New project form state
    const [newProject, setNewProject] = useState({ name: '', description: '', githubRepo: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        fetchProjects();

        if (location.state?.createFromRepo) {
            const repo = location.state.createFromRepo;
            setNewProject(prev => ({
                ...prev,
                name: repo.name,
                description: repo.description || '',
                githubRepo: repo.full_name
            }));
            setShowCreateModal(true);
            // Clear state so it doesn't persist
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    // WebSocket Listener for Real-time Updates
    useEffect(() => {
        if (!socket) return;

        const handleProjectCreated = (newProject) => {
            console.log("SOCKET EVENT: project_created received", newProject);
            setProjects(prev => {
                const updated = [newProject, ...prev];
                console.log("State updated (create)", updated);
                return updated;
            });
        };

        const handleProjectDeleted = ({ projectId }) => {
            console.log("SOCKET EVENT: project_deleted received", projectId);
            setProjects(prev => {
                const updated = prev.filter(p => p._id !== projectId);
                console.log("State updated (delete)", updated);
                return updated;
            });
        };

        const handleProjectUpdated = (updatedProject) => {
            console.log("SOCKET EVENT: project_updated received", updatedProject);
            setProjects(prev => {
                const updated = prev.map(p => p._id === updatedProject._id ? updatedProject : p);
                console.log("State updated (update)", updated);
                return updated;
            });
        };

        console.log("Setting up socket listeners for projects");
        socket.on('project_created', handleProjectCreated);
        socket.on('project_deleted', handleProjectDeleted);
        socket.on('project_updated', handleProjectUpdated);

        return () => {
            console.log("Cleaning up socket listeners");
            socket.off('project_created', handleProjectCreated);
            socket.off('project_deleted', handleProjectDeleted);
            socket.off('project_updated', handleProjectUpdated);
        };
    }, [socket]);

    const fetchProjects = async () => {
        try {
            const res = await projectAPI.getProjects();
            setProjects(res.data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await projectAPI.createProject(newProject);
            setShowCreateModal(false);
            setNewProject({ name: '', description: '', githubRepo: '' });
            fetchProjects();
            success('Project created successfully');
        } catch (error) {
            toastError('Failed to create project: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your work and collaborate.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative hidden md:block">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 w-64 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FaPlus /> <span>New Project</span>
                    </button>
                </div>
            </div>
            {/* Mobile Search - Visible only on small screens */}
            <div className="md:hidden mb-6 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 w-full"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <Link
                            to={`/projects/${project._id}`}
                            key={project._id}
                            className="card-glass p-6 group hover:border-violet-500/50 transition-all hover:shadow-lg hover:-translate-y-1 block h-full flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl">
                                    <FaFolder />
                                </div>
                                {project.githubRepo && (
                                    <div className="text-slate-400 dark:text-slate-600" title={project.githubRepo}>
                                        <FaCodeBranch />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                {project.name}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
                                {project.description || 'No description provided.'}
                            </p>

                            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-auto flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center space-x-2">
                                    <FaUsers />
                                    <span>{(project.contributors?.length || 0) + 1} members</span>
                                </div>
                                <div className="flex items-center space-x-1 font-medium group-hover:translate-x-1 transition-transform">
                                    <span>Open</span>
                                    <FaArrowRight />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {projects.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <FaFolder className="mx-auto text-4xl mb-4 opacity-50" />
                            <p className="text-lg font-medium">No projects yet</p>
                            <p className="mb-6">Create your first project to get started.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
                            >
                                Create Project
                            </button>
                        </div>
                    )}

                    {projects.length > 0 && filteredProjects.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                            <FaSearch className="mx-auto text-3xl mb-3 opacity-30" />
                            <p>No projects match your search.</p>
                        </div>
                    )}
                </div>
            )
            }

            {/* Create Project Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Project</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        placeholder="e.g. Website Redesign"
                                        value={newProject.name}
                                        onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea
                                        className="input-field min-h-[100px]"
                                        placeholder="Project goals and details..."
                                        value={newProject.description}
                                        onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Repo (Optional)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="owner/repo"
                                        value={newProject.githubRepo}
                                        onChange={e => setNewProject({ ...newProject, githubRepo: e.target.value })}
                                    />
                                </div>
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProjectsPage;
