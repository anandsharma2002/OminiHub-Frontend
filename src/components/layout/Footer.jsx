import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaRocket } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div className="page-container py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                                <FaRocket className="text-sm" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                                OmniHub
                            </span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            The comprehensive ecosystem intended for modern engineering teams. Plan, build, and ship faster with OmniHub.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialIcon icon={<FaGithub />} />
                            <SocialIcon icon={<FaTwitter />} />
                            <SocialIcon icon={<FaLinkedin />} />
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><FooterLink to="/features">Features</FooterLink></li>
                            <li><FooterLink to="/integrations">Integrations</FooterLink></li>
                            <li><FooterLink to="/pricing">Pricing</FooterLink></li>
                            <li><FooterLink to="/roadmap">Roadmap</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Resources</h4>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><FooterLink to="/docs">Documentation</FooterLink></li>
                            <li><FooterLink to="/api">API Reference</FooterLink></li>
                            <li><FooterLink to="/blog">Blog</FooterLink></li>
                            <li><FooterLink to="/community">Community</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><FooterLink to="/about">About Us</FooterLink></li>
                            <li><FooterLink to="/careers">Careers</FooterLink></li>
                            <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
                            <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-500">
                    <p>© {new Date().getFullYear()} OmniHub Inc. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <span className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>All Systems Operational</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <Link to={to} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
        {children}
    </Link>
);

const SocialIcon = ({ icon }) => (
    <a href="#" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all">
        {icon}
    </a>
);

export default Footer;
