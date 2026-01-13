import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaBars, FaTimes, FaRocket } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, children }) => (
        <Link
            to={to}
            className={`font-medium transition-all duration-300 ${isActive(to)
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
        >
            {children}
        </Link>
    );

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 h-[var(--nav-height)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                            <FaRocket className="text-sm" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                            OmniHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/features">Features</NavLink>
                        <NavLink to="/pricing">Pricing</NavLink>
                        <NavLink to="/dosc">Docs</NavLink>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600 transition-colors">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600 transition-colors">
                                    Log In
                                </Link>
                                <Link to="/signup" className="btn-primary text-sm px-5 py-2">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-600 dark:text-slate-300 hover:text-violet-600 focus:outline-none"
                        >
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-[var(--nav-height)] left-0 w-full bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        <Link to="/" className="block text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/features" className="block text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link to="/pricing" className="block text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600" onClick={() => setIsMenuOpen(false)}>Pricing</Link>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-3">
                            {user ? (
                                <>
                                    <Link to="/dashboard" className="block text-center w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300" onClick={() => setIsMenuOpen(false)}>Go to Dashboard</Link>
                                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full py-2 text-center text-red-500 font-medium">Log Out</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-center w-full py-2 text-slate-600 dark:text-slate-300 font-medium" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                                    <Link to="/signup" className="block text-center w-full btn-primary" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
