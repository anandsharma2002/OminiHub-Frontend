import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import GitHubSection from '../components/profile/GitHubSection';
import { Link, useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import api from '../api/axios';

const GitHubPage = () => {
    const { user } = useAuth();
    const [isPublic, setIsPublic] = useState(user?.isGithubPublic ?? true);
    const [visibleRepos, setVisibleRepos] = useState(user?.visibleRepositories || []);

    useEffect(() => {
        if (user) {
            setIsPublic(user.isGithubPublic);
            setVisibleRepos(user.visibleRepositories || []);
        }
    }, [user]);

    const toggleVisibility = async () => {
        try {
            const response = await api.put('/users/github-visibility');
            if (response.data.status === 'success') {
                setIsPublic(response.data.data.isGithubPublic);
            }
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        }
    };

    const toggleRepo = async (repoId) => {
        try {
            // Optimistic update
            const isVisible = visibleRepos.includes(repoId);
            const newVisibleRepos = isVisible
                ? visibleRepos.filter(id => id !== repoId)
                : [...visibleRepos, repoId];

            setVisibleRepos(newVisibleRepos);

            // If enabling a repo and Global is OFF, turn Global ON locally
            if (!isVisible && !isPublic) {
                setIsPublic(true);
            }

            const response = await api.put('/users/github-repos', { repoId });

            if (response.data.status === 'success') {
                setVisibleRepos(response.data.data.visibleRepositories);
                setIsPublic(response.data.data.isGithubPublic);
            }
        } catch (error) {
            console.error('Failed to toggle repo visibility:', error);
            // Revert or fetch latest user data could be done here
        }
    };

    // Helper to extract username (reuse logic from Profile.jsx)
    const getGithubUsername = () => {
        if (!user?.profile?.socialLinks) return null;
        const githubLink = user.profile.socialLinks.find(link => {
            if (!link) return false;
            const url = typeof link === 'object' ? link.url : link;
            return url && (url.includes('github.com') || (typeof link === 'object' && link.platform?.toLowerCase() === 'github'));
        });

        if (githubLink) {
            const url = typeof githubLink === 'object' ? githubLink.url : githubLink;
            // Extract username: match the last segment 
            const match = url.match(/github\.com\/([^\/]+)\/?$/);
            if (match && match[1]) return match[1];

            // Fallback for just username or other formats
            const parts = url.split('/').filter(Boolean);
            if (parts.length > 0) return parts[parts.length - 1];
        }
        return null;
    };

    const username = getGithubUsername();

    const navigate = useNavigate();

    const handleCreateProject = (repo) => {
        navigate('/projects', { state: { createFromRepo: repo } });
    };

    return (
        <div className="page-container">
            <div className='flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0'>
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center sm:justify-start">
                        <FaGithub className="mr-3 text-slate-800 dark:text-white" />
                        GitHub Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track your repositories and contributions.
                    </p>
                </div>
                {/* Visibility Toggle */}
                {username && (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mr-3 px-2">
                            Public Visibility
                        </span>

                        <button
                            onClick={toggleVisibility}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                                ${isPublic ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                    ${isPublic ? 'translate-x-6' : 'translate-x-1'}
                                `}
                            />
                        </button>
                    </div>
                )}
            </div>

            {
                username ? (
                    <GitHubSection
                        username={username}
                        isOwner={true}
                        visibleRepos={visibleRepos}
                        onToggleRepo={toggleRepo}
                        onCreateProject={handleCreateProject}
                    />
                ) : (
                    <div className="card-glass p-12 text-center max-w-2xl mx-auto mt-10">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaGithub className="text-4xl text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Connect your GitHub</h2>
                        <p className="mb-8 text-slate-500 dark:text-slate-400">
                            Link your GitHub account in your profile settings to see your repositories, followers, and contribution graph here.
                        </p>
                        <Link to="/profile" className="btn-primary inline-flex items-center">
                            Go to Profile Settings
                        </Link>
                    </div>
                )
            }
        </div >
    );
};

export default GitHubPage;
