import React, { useState, useEffect } from 'react';
import { FaGithub, FaStar, FaCodeBranch, FaCircle, FaExternalLinkAlt, FaPlus, FaTimes } from 'react-icons/fa';
import api from '../../api/axios';

const GitHubSection = ({ username, isOwner, visibleRepos = [], isPublic, onToggleRepo, onTogglePublic, onCreateProject, allowAddLink = false, allowCreateProject = false }) => {
    const [data, setData] = useState(null);
    const [visibleCount, setVisibleCount] = useState(6);
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [linkInput, setLinkInput] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Profile & Repos from our Backend
                const res = await api.get(`/github/${username}`);
                setData(res.data);


            } catch (err) {
                console.error("GitHub fetch error:", err);
                setError("Failed to load GitHub data");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchData();
        }
    }, [username]);

    if (loading) return (
        <div className="card-glass p-6 animate-pulse">
            <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        </div>
    );

    if (error) return null; // Hide if error or user not found

    if (!data || !data.profile) return null;

    const { profile, repos } = data;

    // Filter repos if not owner
    const displayedRepos = isOwner
        ? repos
        : repos.filter(repo => visibleRepos.includes(String(repo.id)));

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="card-glass p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <FaGithub className="text-3xl text-slate-800 dark:text-white" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">GitHub Activity</h3>
                            {isOwner && (
                                <p className="text-xs text-slate-500">
                                    Status: <span className={isPublic ? "text-violet-500 font-bold" : "text-slate-400 font-bold"}>{isPublic ? "Visible to Everyone" : "Private (Visible only to you)"}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {isOwner && onTogglePublic && (
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-500 uppercase hidden sm:inline">Public Visibility</span>
                            <button
                                onClick={onTogglePublic}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${isPublic ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-500 uppercase font-bold">Followers</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.followers}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-500 uppercase font-bold">Following</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.following}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-500 uppercase font-bold">Public Repos</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.public_repos}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Gists</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.public_gists}</p>
                    </div>
                </div>


            </div>

            {/* Repositories */}
            {displayedRepos.length > 0 && (
                <>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white px-2">Top Repositories</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayedRepos.slice(0, visibleCount).map(repo => {
                            const isVisible = visibleRepos.includes(String(repo.id));
                            return (
                                <div key={repo.id} className="relative group h-full">
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`card-glass p-5 hover:border-violet-500 transition-colors flex flex-col justify-between h-full ${!isVisible && isOwner ? 'opacity-75 hover:opacity-100' : ''}`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3 gap-3">
                                                <h4 className="font-bold text-violet-600 dark:text-violet-400 group-hover:text-violet-500 truncate flex-1" title={repo.name}>
                                                    {repo.name}
                                                </h4>

                                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    {isOwner && onToggleRepo ? (
                                                        <div
                                                            className={`
                                                                flex items-center gap-2 px-2 py-1 rounded-full border transition-all cursor-pointer shadow-sm
                                                                ${isVisible
                                                                    ? 'bg-violet-50/80 border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/50'
                                                                    : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}
                                                            `}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                onToggleRepo(String(repo.id));
                                                            }}
                                                        >
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isVisible ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
                                                                {repo.visibility}
                                                            </span>
                                                            <div
                                                                className={`
                                                                    relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300
                                                                    ${isVisible ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}
                                                                `}
                                                            >
                                                                <span
                                                                    className={`
                                                                        inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 shadow-sm
                                                                        ${isVisible ? 'translate-x-[18px]' : 'translate-x-0.5'}
                                                                    `}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium uppercase tracking-wide">
                                                            {repo.visibility}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 min-h-[2.5rem]">
                                                {repo.description || 'No description available'}
                                            </p>

                                            {/* Hosting Link & Add Button */}
                                            <div className="flex justify-between items-center mt-auto mb-2 relative z-20">
                                                {repo.hostingLink && (
                                                    <a
                                                        href={repo.hostingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                                                    >
                                                        <FaExternalLinkAlt size={10} /> Visit Link
                                                    </a>
                                                )}

                                                {allowAddLink && isOwner && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedRepo(repo);
                                                            setLinkInput(repo.hostingLink || '');
                                                            setShowLinkPopup(true);
                                                        }}
                                                        className="ml-auto text-xs flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                                                        title="Add/Edit Hosting Link"
                                                    >
                                                        <FaPlus size={8} /> Link
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-3 mt-auto">
                                            {repo.language && (
                                                <div className="flex items-center space-x-1">
                                                    <FaCircle className="text-[10px] text-yellow-400" />
                                                    <span>{repo.language}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-1">
                                                <FaStar className="text-amber-400" />
                                                <span>{repo.stargazers_count}</span>
                                            </div>

                                            {/* Create Project Button */}
                                            {allowCreateProject && isOwner && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (onCreateProject) {
                                                            onCreateProject(repo);
                                                        } else {
                                                            console.log("Create Project from", repo.name);
                                                        }
                                                    }}
                                                    className="ml-auto px-2 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-md hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors font-medium"
                                                >
                                                    + Project
                                                </button>
                                            )}
                                        </div>
                                    </a>
                                </div>
                            )
                        })}
                    </div>

                    {/* Show More / Show Less Buttons */}
                    {displayedRepos.length > 6 && (
                        <div className="flex justify-center mt-6">
                            {visibleCount < displayedRepos.length ? (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Show More ({displayedRepos.length - visibleCount} remaining)
                                </button>
                            ) : (
                                <button
                                    onClick={() => setVisibleCount(6)}
                                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Show Less
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
            {/* Link Popup Modal */}
            {showLinkPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Add Hosting Link
                                </h3>
                                <button
                                    onClick={() => setShowLinkPopup(false)}
                                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <FaTimes className="text-slate-500" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Hosting URL for <span className="text-violet-600 font-bold">{selectedRepo?.name}</span>
                                </label>
                                <input
                                    type="url"
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    placeholder="https://your-project-demo.com"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-white"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowLinkPopup(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.put('/users/repo-link', {
                                                repoId: selectedRepo.id,
                                                url: linkInput
                                            });

                                            // Update local state
                                            setData(prev => ({
                                                ...prev,
                                                repos: prev.repos.map(r =>
                                                    r.id === selectedRepo.id
                                                        ? { ...r, hostingLink: linkInput }
                                                        : r
                                                )
                                            }));

                                            setShowLinkPopup(false);
                                        } catch (err) {
                                            console.error("Failed to save link", err);
                                            alert("Failed to save link. Please try again.");
                                        }
                                    }}
                                    className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/25"
                                >
                                    Save Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GitHubSection;
