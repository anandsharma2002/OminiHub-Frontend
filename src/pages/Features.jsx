import React from 'react';
import Footer from '../components/layout/Footer';
import { FaRocket, FaCode, FaComments, FaGithub, FaLock, FaChartLine, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ChatImage from '../assets/chat1.png';
import GitHubImage from '../assets/GitHub1.png';
import BoardImage from '../assets/Board1.png';
import GeminiImage from '../assets/Gemini.png';

const Features = () => {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#020617]">
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px] -z-10 animate-blob"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-blob animation-delay-2000"></div>

                    <div className="page-container text-center relative z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">
                            Powerful Features for <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500">Modern Teams</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
                            OmniHub brings all your development tools under one roof. Stop context switching and start shipping.
                        </p>
                    </div>
                </section>

                {/* Feature 1: Real-time Chat */}
                <section className="py-16 bg-white dark:bg-[#020617]">
                    <div className="page-container">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 order-2 md:order-1">
                                <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-200/50 dark:border-violet-800/30">
                                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                        <FaComments />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Real-time Team Chat</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                                        Communicate with your team instantly. Send direct messages and collaborate in real-time to keep your projects moving forward.
                                    </p>
                                    <ul className="space-y-3">
                                        {['Instant messaging', 'User search', 'Active status indicators'].map((item, i) => (
                                            <li key={i} className="flex items-center text-slate-600 dark:text-slate-400">
                                                <FaCheck className="text-emerald-500 mr-3" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex-1 order-1 md:order-2">
                                <div className="relative h-80 w-full group flex items-center justify-center">
                                    <img src={ChatImage} alt="Real-time Chat Interface" className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 2: GitHub Integration */}
                <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
                    <div className="page-container">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1">
                                <div className="relative h-80 w-full group flex items-center justify-center">
                                    <img src={GitHubImage} alt="GitHub Integration" className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl flex items-center justify-center text-3xl mb-6">
                                        <FaGithub />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Deep GitHub Integration</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                                        Link your GitHub account to view repositories directly in OmniHub. Create new projects from existing repos with a single click.
                                    </p>
                                    <ul className="space-y-3">
                                        {['View repositories', 'Visibility management', 'Repo-to-Project creation'].map((item, i) => (
                                            <li key={i} className="flex items-center text-slate-600 dark:text-slate-400">
                                                <FaCheck className="text-emerald-500 mr-3" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 3: Project Management */}
                <section className="py-16 bg-white dark:bg-[#020617]">
                    <div className="page-container">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 order-2 md:order-1">
                                <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-200/50 dark:border-emerald-800/30">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                        <FaChartLine />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Agile Project Management</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                                        Organize your work with intuitive Kanban boards. Track task progress and manage team contributions effectively.
                                    </p>
                                    <ul className="space-y-3">
                                        {['Kanban boards', 'Task tracking', 'Team collaboration'].map((item, i) => (
                                            <li key={i} className="flex items-center text-slate-600 dark:text-slate-400">
                                                <FaCheck className="text-emerald-500 mr-3" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex-1 order-1 md:order-2">
                                <div className="relative h-80 w-full group flex items-center justify-center">
                                    <img src={BoardImage} alt="Kanban Board" className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 4: AI Assistance */}
                <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
                    <div className="page-container">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1">
                                <div className="relative h-80 w-full group flex items-center justify-center">
                                    <img src={GeminiImage} alt="AI Assistance" className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                        <FaRocket />
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI-Powered Assistance</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                                        OmniHub Intelligence is your coding companion held directly within the platform. Get answers, generate code, and solve problems faster.
                                    </p>
                                    <ul className="space-y-3">
                                        {['Gemini AI integration', 'Code generation', 'Instant answers'].map((item, i) => (
                                            <li key={i} className="flex items-center text-slate-600 dark:text-slate-400">
                                                <FaCheck className="text-emerald-500 mr-3" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-center">
                    <div className="page-container relative">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                            <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl -top-32 -left-32"></div>
                            <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl -bottom-32 -right-32"></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to streamline your workflow?</h2>
                            <p className="text-violet-100 text-lg max-w-2xl mx-auto mb-10">
                                Join thousands of developers using OmniHub to build better software, faster.
                            </p>
                            <Link to="/signup" className="inline-block px-8 py-4 bg-white text-violet-600 font-bold rounded-xl shadow-xl hover:bg-violet-50 hover:scale-105 transition-all">
                                Get Started for Free
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Features;
