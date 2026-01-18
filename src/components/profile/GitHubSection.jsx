
import React, { useState, useEffect } from 'react';

import { FaGithub, FaStar, FaCodeBranch, FaCircle } from 'react-icons/fa';
import axios from 'axios';

const GitHubSection = ({ username }) => {
    const [data, setData] = useState(null);
    const [visibleCount, setVisibleCount] = useState(6);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Profile & Repos from our Backend
                const res = await axios.get(`http://localhost:5000/api/github/${username}`);
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

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="card-glass p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <FaGithub className="text-3xl text-slate-800 dark:text-white" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">GitHub Activity</h3>
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white px-2">Top Repositories</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.slice(0, visibleCount).map(repo => (
                    <a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-glass p-5 hover:border-violet-500 transition-colors group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-violet-600 dark:text-violet-400 group-hover:text-violet-500 truncate pr-2">
                                    {repo.name}
                                </h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {repo.visibility}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 h-10">
                                {repo.description || 'No description available'}
                            </p>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                            {repo.language && (
                                <div className="flex items-center space-x-1">
                                    <FaCircle className="text-[10px] text-yellow-400" />
                                    <span>{repo.language}</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-1">
                                <FaStar />
                                <span>{repo.stargazers_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <FaCodeBranch />
                                <span>{repo.forks_count}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Show More / Show Less Buttons */}
            {repos.length > 6 && (
                <div className="flex justify-center mt-6">
                    {visibleCount < repos.length ? (
                        <button
                            onClick={() => setVisibleCount(prev => prev + 6)}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Show More ({repos.length - visibleCount} remaining)
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
        </div>
    );
};

export default GitHubSection;
