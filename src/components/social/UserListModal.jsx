import React, { useEffect, useState } from 'react';
import { FaTimes, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getFollowers, getFollowing, removeFollower } from '../../api/social';
import { useConfirm } from '../../context/ConfirmContext';

const UserListModal = ({ isOpen, onClose, userId, type, title }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showConfirm } = useConfirm();

    const isOwnList = currentUser && currentUser._id === userId;

    const handleRemove = async (followerId) => {
        const isConfirmed = await showConfirm("Remove this follower?", "Remove User", "danger");
        if (!isConfirmed) return;
        try {
            await removeFollower(followerId);
            // Remove from local list
            setUsers(prev => prev.filter(u => u._id !== followerId));
        } catch (err) {
            console.error("Failed to remove follower", err);
        }
    };

    useEffect(() => {
        if (isOpen && userId && type) {
            fetchUsers();
        } else {
            setUsers([]);
        }
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (type === 'followers') {
                res = await getFollowers(userId);
            } else {
                res = await getFollowing(userId);
            }
            // Ensure we handle both likely API response formats (array or { data: [] })
            // API returns { status: 'success', data: [...] }
            // Axios response is in res.data, so user array is in res.data.data
            const list = res.data?.data || [];
            if (Array.isArray(list)) {
                setUsers(list);
            } else {
                console.error("Expected array but got:", list);
                setUsers([]);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Failed to load list.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col relative border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                        {title || type}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500 animate-pulse">Loading...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No users found.</div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user._id} className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <Link
                                        to={`/user/${user._id}`}
                                        onClick={onClose}
                                        className="flex items-center space-x-3 flex-1 min-w-0"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                            {user.profile?.image ? (
                                                <img src={user.profile.image} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <FaUser className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                                        </div>
                                    </Link>

                                    {isOwnList && type === 'followers' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemove(user._id);
                                            }}
                                            className="ml-2 px-3 py-1 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-red-200 dark:border-red-900/30"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
