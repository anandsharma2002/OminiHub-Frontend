import React from 'react';
import Footer from '../components/layout/Footer';
import { FaRocket, FaTools, FaBook, FaArrowRight, FaCodeBranch, FaUsers, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#020617]">

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-12 lg:py-32 overflow-hidden">
                    {/* Glowing Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-violet-500/20 rounded-full blur-[80px] md:blur-[120px] -z-10 animate-blob"></div>
                    <div className="absolute bottom-0 right-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-indigo-500/20 rounded-full blur-[60px] md:blur-[100px] -z-10 animate-blob animation-delay-2000"></div>

                    <div className="page-container text-center relative z-10">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-xs md:text-sm font-semibold mb-6 md:mb-8 animate-fade-in border border-violet-200 dark:border-violet-800">
                            <span className="flex h-2 w-2 relative mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            v1.0 Public Beta Live
                        </div>

                        <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 md:mb-8 tracking-tight">
                            Build faster together with <br className="hidden md:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500">OmniHub Intelligence</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-4">
                            The all-in-one developer platform that combines project management, documentation, and automated workflows into a single premium experience.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                            <Link to="/signup" className="btn-primary text-base md:text-lg px-8 py-3 md:py-4 shadow-xl shadow-violet-500/20 flex items-center justify-center space-x-2 group w-full sm:w-auto">
                                <span>Start Building Free</span>
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/features" className="px-8 py-3 md:py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all w-full sm:w-auto">
                                View Demo
                            </Link>
                        </div>

                        {/* UI Mockup */}
                        <div className="mt-12 md:mt-20 mx-auto max-w-6xl rounded-2xl p-2 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-2xl">
                            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video relative group">
                                {/* Simulating a dashboard image */}
                                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-700">
                                    {/* Placeholder Gradient if image fails */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900/20"></div>
                                    <img
                                        src="https://placehold.co/1200x675/0f172a/ffffff?text=OmniHub+Premium+Dashboard"
                                        alt="Dashboard Preview"
                                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benton Grid Features Section */}
                <section className="py-16 md:py-24 bg-white dark:bg-[#020617]">
                    <div className="page-container">
                        <div className="text-center mb-12 md:mb-20">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Everything you need in one place</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg px-4">
                                Stop juggling multiple subscriptions. OmniHub connects every part of your creative workflow.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {/* Card 1: Main Feature (Span 2 cols) */}
                            <div className="md:col-span-2 card-glass p-8 group hover:border-violet-500/30 transition-colors relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/20 transition-all"></div>
                                <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <FaCodeBranch />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Advanced Project Management</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                    Visualize your roadmap with premium Kanban boards, Gantt charts, and sprint planning tools designed specifically for engineering teams. Synchronize seamlessly with GitHub.
                                </p>
                                <div className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 w-full overflow-hidden relative">
                                    {/* Mockup decoration */}
                                    <div className="absolute top-4 left-4 right-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    <div className="absolute top-8 left-4 w-1/3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    <div className="absolute top-16 left-4 right-4 bottom-4 grid grid-cols-3 gap-4">
                                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm"></div>
                                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm"></div>
                                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="card-glass p-8 group hover:border-emerald-500/30 transition-colors">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <FaUsers />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-time Collaboration</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Pair program, review code, and chat with your team without leaving the app.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="card-glass p-8 group hover:border-amber-500/30 transition-colors">
                                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <FaBook />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Interactive Docs</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Turn your markdown into beautiful, searchable knowledge bases automatically.
                                </p>
                            </div>

                            {/* Card 4: Span 2 cols */}
                            <div className="md:col-span-2 card-glass p-8 group hover:border-indigo-500/30 transition-colors flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1">
                                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                        <FaShieldAlt />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Enterprise Security</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        SSO, Audit Logs, and Role-Based Access Control built-in from day one. Your data is encrypted at rest and in transit.
                                    </p>
                                </div>
                                <div className="w-full md:w-1/3 h-32 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg flex items-center justify-center text-white/90 text-4xl">
                                    <FaShieldAlt />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
