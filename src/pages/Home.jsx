import React from 'react';
import Footer from '../components/layout/Footer';
import { FaRocket, FaTools, FaBook, FaArrowRight, FaCodeBranch, FaUsers, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import DashboardImage from '../assets/Dashboard1.png';
import ProjectImage from '../assets/Project1.png';
import ChatImage2 from '../assets/chat2.png';
import GeminiImage from '../assets/Gemini.png';

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#020617]">

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-12 lg:py-10 overflow-hidden">
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
                            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                                <img
                                    src={DashboardImage}
                                    alt="Dashboard Preview"
                                    className="w-full h-auto object-contain"
                                />
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
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Project Management</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                    Visualize your workflow with intuitive Kanban boards. Track tasks, manage contributors, and streamline your development process in one central hub.
                                </p>
                                <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 w-full mt-6 shadow-sm">
                                    <img
                                        src={ProjectImage}
                                        alt="Project Management"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="card-glass p-8 group hover:border-emerald-500/30 transition-colors">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <FaUsers />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-time Chat</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Connect with your team instantly. Direct messaging helps you stay aligned without leaving the app.
                                </p>
                                <div className="mt-6 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                                    <img src={ChatImage2} alt="Real-time Chat" className="w-full h-auto object-cover" />
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="card-glass p-8 group hover:border-amber-500/30 transition-colors">
                                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <FaBook />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Knowledge Base</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Create and organize documentation. Keep your project details and guides accessible to everyone.
                                </p>
                            </div>

                            {/* Card 4: Span 2 cols */}
                            <div className="md:col-span-2 card-glass p-8 group hover:border-indigo-500/30 transition-colors flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1">
                                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                        <FaRocket />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AI-Powered Assistance</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Leverage the power of Gemini AI directly within OmniHub. Generate code, brainstorm ideas, and get answers to your technical questions instantly.
                                    </p>
                                </div>
                                <div className="w-full md:w-1/3 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700">
                                    <img src={GeminiImage} alt="AI Assistance" className="w-full h-full object-cover" />
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
