import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userAPI from '../api/user';
import docsApi from '../api/docs';
import DocumentCard from '../components/documents/DocumentCard';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt, FaArrowLeft, FaFileAlt, FaLock, FaGithub, FaLinkedin, FaCode, FaGlobe } from 'react-icons/fa';

import GitHubSection from '../components/profile/GitHubSection';
import FollowButton from '../components/social/FollowButton';
import UserListModal from '../components/social/UserListModal';
import { useSocket } from '../context/SocketContext';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();

    const [user, setUser] = useState(null);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [docsLoading, setDocsLoading] = useState(true);
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
    // Filter documents
    const publicDocs = docs.filter(doc => doc.privacy === 'public');
    const privateDocs = docs.filter(doc => doc.privacy === 'private');

    // ... existing useEffect ...

    // Real-time Follow Updates
    useEffect(() => {
        if (!socket) return;

        const handleFollowUpdate = (data) => {
            // Check if update is relevant to the user being viewed OR the current user
            // If the viewed user's followers changed, refetch
            // If the current user followed someone, refetch (if viewing own profile or the target)
            
            // Simplest Logic: Refetch if the event relates to the displayed user
            // data.userId might be the one who performed the action OR the target
            
            // Actually, my backend emits 'follow_update' to specific recipients.
            // If I am viewing User X, and I receive a 'follow_update', it means *I* was involved or *I* am X.
            // But here we want to update the UI if WE are viewing X and someone else follows X.
            // Wait, my backend implementation only emits to Recipient and Requester.
            // It does NOT broadcast to everyone viewing the profile.
            // So:
            // 1. If I follow X, X gets event. I get event.
            // 2. If Y follows X, X gets event. Y gets event. I (Observer) DO NOT get event.
            
            // Limitation: Real-time count updates for strictly 3rd party observers requires Room broadcasting (e.g., join 'profile_view_X').
            // For now, let's just handle the case where *I* am involved or *I* am the user profile being viewed (e.g. separate tab).
            
            // Ideally, we should join a room based on profileId.
            // But given current backend, let's just refetch if we get an event.
            fetchUserProfile(); 
        };

        socket.on('follow_update', handleFollowUpdate);

        return () => {
            socket.off('follow_update', handleFollowUpdate);
        };
    }, [socket, id]); // dependent on id to re-bind if needed, though handleFollowUpdate calls fetchUserProfile which depends on id

    useEffect(() => {
        const fetchUserDocs = async () => {
            try {
                const res = await docsApi.getDocuments(id);
                setDocs(res);
            } catch (err) {
                console.error("Failed to fetch docs", err);
            } finally {
                setDocsLoading(false);
            }
        };

        if (id) {
            fetchUserProfile();
            fetchUserDocs();
        }
    }, [id]);

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
        <div className="page-container">
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
                        <p className="text-slate-500 dark:text-slate-400 mb-2">@{user.username}</p>

                        <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-sm font-medium mb-6">
                            {user.role || 'User'}
                        </span>


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
                            <div className="mb-6">
                                <FollowButton
                                    targetUserId={user._id}
                                    onSuccess={() => {
                                        // Refetch user profile to update stats immediately
                                        fetchUserProfile();
                                    }}
                                />
                            </div>
                        )}

                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <FaEnvelope className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">Email Address</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <FaCalendarAlt className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">Joined</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                        {joinDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-glass p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {user.profile?.bio || 'No bio available yet.'}
                        </p>
                    </div>

                    {/* Social Profiles */}
                    {user.profile?.socialLinks?.length > 0 && (
                        <div className="card-glass p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Social Profiles</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.profile.socialLinks.map((link, index) => {
                                    const platform = typeof link === 'object' ? link.platform : 'Website';
                                    const url = typeof link === 'object' ? link.url : link;

                                    return (
                                        <a
                                            key={index}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-violet-600 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors">
                                                {getPlatformIcon(platform)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{platform}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[150px]">{url}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="card p-6 border-l-4 border-violet-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Projects</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{user.projects?.length || 0}</p>
                        </div>
                        <div className="card p-6 border-l-4 border-indigo-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Public Docs</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{publicDocs.length}</p>
                        </div>
                        {isOwnProfile && (
                            <div className="card p-6 border-l-4 border-slate-500">
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Private Docs</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{privateDocs.length}</p>
                            </div>
                        )}
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
                                    <div className="mt-8">
                                        <GitHubSection
                                            username={username}
                                            isOwner={isOwnProfile}
                                            visibleRepos={user.visibleRepositories || []}
                                        />
                                    </div>
                                );
                            }
                        }
                        return null;
                    })()}

                    {/* Public Documents Section */}
                    {(!isOwnProfile || publicDocs.length > 0) && (
                        <div className="card-glass p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FaFileAlt className="text-violet-500" /> Public Documents
                                </h3>
                            </div>

                            {docsLoading ? (
                                <div className="text-slate-500 animate-pulse">Loading documents...</div>
                            ) : publicDocs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {publicDocs.map(doc => (
                                        <DocumentCard
                                            key={doc._id}
                                            doc={{ ...doc, readOnly: !isOwnProfile }}
                                            onDelete={isOwnProfile ? (id) => console.log("Delete", id) : undefined}
                                            onUpdate={isOwnProfile ? (d) => console.log("Update", d) : undefined}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-500 dark:text-slate-400 text-sm italic">
                                    No public documents to show.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Private Documents Section (Only for Owner) */}
                    {isOwnProfile && (
                        <div className="card-glass p-6 border-l-4 border-slate-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FaLock className="text-slate-500" /> Private Documents
                                </h3>
                            </div>

                            {docsLoading ? (
                                <div className="text-slate-500 animate-pulse">Loading documents...</div>
                            ) : privateDocs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {privateDocs.map(doc => (
                                        <DocumentCard
                                            key={doc._id}
                                            doc={{ ...doc, readOnly: false }}
                                            onDelete={(id) => console.log("Delete", id)}
                                            onUpdate={(d) => console.log("Update", d)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-500 dark:text-slate-400 text-sm italic">
                                    No private documents found.
                                </div>
                            )}
                        </div>
                    )}
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
