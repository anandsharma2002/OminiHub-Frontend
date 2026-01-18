import React from 'react';
import useAuth from '../hooks/useAuth';
import GitHubSection from '../components/profile/GitHubSection';
import { Link } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';

const GitHubPage = () => {
    const { user } = useAuth();

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

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                    <FaGithub className="mr-3 text-slate-800 dark:text-white" />
                    GitHub Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Track your repositories and contributions.
                </p>
            </div>

            {username ? (
                <GitHubSection username={username} />
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
            )}
        </div>
    );
};

export default GitHubPage;
