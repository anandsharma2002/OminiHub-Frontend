import React, { useState, useEffect } from 'react';
import projectAPI from '../../api/project';
import { FaUserPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import userAPI from '../../api/user';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ContributorsComponent = ({ project, onUpdate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { socket } = useSocket();
    const { user: currentUser } = useAuth();

    const handleSearch = async (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) {
            setIsSearching(true);
            try {
                const res = await userAPI.searchUsers(e.target.value);
                setSearchResults(res.data.users || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const inviteUser = async (userId) => {
        try {
            await projectAPI.inviteUser(project._id, userId);
            setSearchQuery('');
            setSearchResults([]);
            alert("User invited!");
            onUpdate(); // Refresh project data immediately as fallback/confirmation
        } catch (error) {
            alert(error.response?.data?.message || "Failed to invite user");
        }
    };

    const removeUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to remove ${username} from this project?`)) return;
        try {
            await projectAPI.removeContributor(project._id, userId);
            // Socket will handle update
        } catch (error) {
            alert(error.response?.data?.message || "Failed to remove user");
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleProjectUpdate = (data) => {
            if (data.projectId === project._id) {
                onUpdate();
            }
        };

        socket.on('project_updated', handleProjectUpdate);

        return () => {
            socket.off('project_updated', handleProjectUpdate);
        };
    }, [socket, project._id, onUpdate]);

    const isOwner = project.owner?._id === currentUser?._id;

    return (
        <div className="space-y-8">
            {/* Invite User */}
            {isOwner && (
                <div className="max-w-md">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Invite Contributor</h3>
                    <div className="relative">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-10 overflow-hidden">
                                {searchResults.map(user => (
                                    <div key={user._id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-slate-700 flex items-center justify-center text-violet-600 text-xs font-bold">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.username}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => inviteUser(user._id)}
                                            className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                                        >
                                            Invite
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Contributors List */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Project Members</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <td className="px-6 py-4 flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-xs">{project.owner?.username?.[0]?.toUpperCase()}</div>
                                    <span className="font-medium text-slate-900 dark:text-white">{project.owner?.username}</span>
                                    <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">Owner</span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">Admin</td>
                                <td className="px-6 py-4 text-green-500 text-sm">Active</td>
                                <td className="px-6 py-4"></td>
                            </tr>
                            {project.contributors?.map(contributor => (
                                <tr key={contributor._id}>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">{contributor.user?.username?.[0]?.toUpperCase()}</div>
                                        <span className="font-medium text-slate-900 dark:text-white">{contributor.user?.username}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{contributor.role || 'Member'}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${contributor.status === 'Accepted' ? 'bg-green-100 text-green-600' :
                                            contributor.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {contributor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Actions for owner */}
                                        {isOwner && (
                                            <button
                                                onClick={() => removeUser(contributor.user._id, contributor.user.username)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContributorsComponent;
