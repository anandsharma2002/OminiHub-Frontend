import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userAPI from '../api/user';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt, FaArrowLeft, FaFileAlt, FaLock, FaGithub, FaLinkedin, FaCode, FaGlobe, FaComments } from 'react-icons/fa';

import GitHubSection from '../components/profile/GitHubSection';
import DocumentsSection from '../components/profile/DocumentsSection';
import FollowButton from '../components/social/FollowButton';
import UserListModal from '../components/social/UserListModal';
import { useSocket } from '../context/SocketContext';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('followers');

    const fetchUserProfile = async () => {
        try {
            const res = await userAPI.getUserProfile(id);
            setUser(res.data.user);
        } catch (err) {
            setError('User not found');
        } finally {
            setLoading(false);
        }
    };

    // Check if viewing own profile
    const isOwnProfile = currentUser && (currentUser._id === id || (user && currentUser._id === user._id));

    // Real-time Update Trigger
    const [followUpdateTrigger, setFollowUpdateTrigger] = useState(0);

    // Initial Fetch
    useEffect(() => {
        if (id) {
            fetchUserProfile();
        }
    }, [id]);

    // Real-time Updates
    useEffect(() => {
        if (!socket || !id) return;

        // Join Profile Room (for public updates)
        const roomName = `profile_${id}`;
        socket.emit('join_entity', roomName);

        const handleConnect = () => {
            console.log("Socket reconnected, re-joining room:", roomName);
            socket.emit('join_entity', roomName);
        };

        const handleFollowUpdate = (data) => {
            console.log("Follow update received", data);
            fetchUserProfile(); // Update counts
            setFollowUpdateTrigger(prev => prev + 1); // Update button status
        };

        socket.on('connect', handleConnect);
        socket.on('follow_update', handleFollowUpdate);
        socket.on('github_update', handleFollowUpdate); // Refetch user profile on GitHub update

        return () => {
            socket.emit('leave_entity', roomName);
            socket.off('connect', handleConnect);
            socket.off('follow_update', handleFollowUpdate);
            socket.off('github_update', handleFollowUpdate);
        };
    }, [socket, id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-violet-600 dark:text-violet-400 font-medium animate-pulse">Loading profile...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-red-500 font-medium">{error || 'User not found'}</div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-violet-600 hover:text-violet-700"
                >
                    <FaArrowLeft />
                    <span>Go Back</span>
                </button>
            </div>
        );
    }

    const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

    // Helper to get icon for platform
    const getPlatformIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('github')) return <FaGithub />;
        if (p.includes('linkedin')) return <FaLinkedin />;
        if (p.includes('leetcode') || p.includes('codeforces')) return <FaCode />;
        return <FaGlobe />; // Default
    };

    return (
        <div className="page-container mt-5 md:mt-0">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-slate-500 hover:text-violet-600 mb-6 transition-colors"
            >
                <FaArrowLeft />
                <span>Back</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="card-glass p-8 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 dark:opacity-40"></div>

                        <div className="relative z-10 mb-4">
                            <div className="w-32 h-32 rounded-full bg-violet-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-5xl font-bold text-violet-600 dark:text-violet-400 overflow-hidden">
                                {user.profile?.image && user.profile.image !== 'default.jpg' ? (
                                    <img
                                        src={user.profile.image}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.username?.[0]?.toUpperCase()
                                )}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex flex-col items-center gap-1 mb-6">
                            <p className="text-slate-500 dark:text-slate-400">@{user.username}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                Joined {joinDate}
                            </p>
                        </div>

                        <div className="flex justify-center w-full gap-8 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div
                                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => { setModalType('followers'); setModalOpen(true); }}
                            >
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.followers?.length || 0}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Followers</p>
                            </div>
                            <div
                                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => { setModalType('following'); setModalOpen(true); }}
                            >
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.following?.length || 0}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Following</p>
                            </div>
                        </div>

                        {!isOwnProfile && (
                            <div className="mb-6 flex items-center justify-center gap-4">
                                <FollowButton
                                    targetUserId={user._id}
                                    onSuccess={() => {
                                        // Refetch user profile to update stats immediately
                                        fetchUserProfile();
                                    }}
                                    refreshTrigger={followUpdateTrigger}
                                />
                                {(() => {
                                    // Check Access Control: A follows B OR B follows A
                                    // currentUser.following (IDs) includes user._id
                                    // user.following (IDs) includes currentUser._id
                                    const amIFollowing = currentUser?.following?.includes(user._id);
                                    const isFollowingMe = user.following?.includes(currentUser?._id);

                                    if (amIFollowing || isFollowingMe) {
                                        return (
                                            <button
                                                onClick={() => navigate('/chat', { state: { initiateChat: user } })}
                                                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-bold hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                                            >
                                                <FaComments />
                                                <span>Message</span>
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}

                        <div className="w-full space-y-4 text-left">
                            {/* About Section Moved Here */}
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-xs text-slate-500 mb-1 font-bold uppercase">About</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {user.profile?.bio || 'No bio available.'}
                                </p>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <FaEnvelope className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">Email Address</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            {/* Social Profiles Moved Here */}
                            {user.profile?.socialLinks?.length > 0 && (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Social Profiles</p>
                                    <div className="space-y-2">
                                        {user.profile.socialLinks.map((link, index) => {
                                            const platform = typeof link === 'object' ? link.platform : 'Website';
                                            const url = typeof link === 'object' ? link.url : link;

                                            return (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                                >
                                                    <span className="text-base">{getPlatformIcon(platform)}</span>
                                                    <span className="truncate">{platform}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="lg:col-span-2 space-y-6">




                    {/* Documents Section */}
                    {/* Documents Section */}
                    <div>
                        <DocumentsSection userId={user._id} isOwner={isOwnProfile} />
                    </div>

                    {/* GitHub Integration Section */}
                    {(() => {
                        // Check Visibility
                        const showGithub = isOwnProfile || user.isGithubPublic;
                        if (!showGithub) return null;

                        const githubLink = user.profile?.socialLinks?.find(link => {
                            if (!link) return false;
                            const url = typeof link === 'object' ? link.url : link;
                            return url && (url.includes('github.com') || (typeof link === 'object' && link.platform?.toLowerCase() === 'github'));
                        });

                        if (githubLink) {
                            const url = typeof githubLink === 'object' ? githubLink.url : githubLink;
                            // Extract username: match the last segment of the url
                            // e.g., https://github.com/username or https://github.com/username/
                            const match = url.match(/github\.com\/([^\/]+)\/?$/);

                            let username = null;
                            if (match && match[1]) {
                                username = match[1];
                            } else {
                                // Try simple split if regex fails
                                const parts = url.split('/').filter(Boolean);
                                if (parts.length > 0) username = parts[parts.length - 1];
                            }

                            if (username) {
                                return (
                                    <div>
                                        <GitHubSection
                                            username={username}
                                            isOwner={isOwnProfile}
                                            visibleRepos={user.visibleRepositories || []}
                                            isPublic={user.isGithubPublic}
                                            onTogglePublic={async () => {
                                                try {
                                                    const res = await userAPI.toggleGithubVisibility();
                                                    if (res.status === 'success') {
                                                        setUser(prev => ({ ...prev, isGithubPublic: res.data.isGithubPublic }));
                                                    }
                                                } catch (err) {
                                                    console.error("Failed to toggle global visibility", err);
                                                }
                                            }}
                                            onToggleRepo={async (repoId) => {
                                                try {
                                                    const res = await userAPI.toggleRepoVisibility(repoId);
                                                    if (res.status === 'success') {
                                                        const { visibleRepositories, isGithubPublic } = res.data;
                                                        setUser(prev => ({ ...prev, visibleRepositories, isGithubPublic }));
                                                    }
                                                } catch (err) {
                                                    console.error("Failed to toggle repo visibility", err);
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            }
                        }
                        return null;
                    })()}

                </div>
            </div>
            {/* User List Modal */}
            <UserListModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userId={user?._id}
                type={modalType}
            />
        </div>
    );
};

export default UserProfile;
