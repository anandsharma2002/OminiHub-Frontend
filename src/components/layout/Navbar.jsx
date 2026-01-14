import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userAPI from '../../api/user';
import { FaBars, FaTimes, FaRocket, FaSearch } from 'react-icons/fa';

const Navbar = () => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Define "inside" pages where dashboard link should be hidden
    const isInsidePage = ['/dashboard', '/docs', '/settings'].some(path => location.pathname.startsWith(path));

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Handle Search
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeout) clearTimeout(searchTimeout);

        if (query.length > 2) {
            setIsSearchLoading(true);
            const timeoutId = setTimeout(async () => {
                try {
                    const data = await userAPI.searchUsers(query);
                    setSearchResults(data.data.users);
                } catch (error) {
                    console.error("Search failed", error);
                    setSearchResults([]);
                } finally {
                    setIsSearchLoading(false);
                }
            }, 500); // Debounce 500ms
            setSearchTimeout(timeoutId);
        } else {
            setSearchResults([]);
            setIsSearchLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };
    // The user wants to hide the "Dashboard" link from the navbar if the user is ON these pages.
    // So if isInsidePage is true, do NOT show dashboard link in navbar.

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
        <nav className="sticky top-0 w-full z-50 transition-all duration-300 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 h-[var(--nav-height)]">
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

                    {/* Search Bar (Desktop) */}
                    {user && (
                        <div className="hidden md:block relative mx-4 flex-1 max-w-md">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <FaSearch />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-200 transition-all"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {(searchResults.length > 0 || isSearchLoading) && searchQuery.length > 2 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#020617] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                                    {isSearchLoading ? (
                                        <div className="p-4 text-center text-slate-500">Searching...</div>
                                    ) : (
                                        <ul>
                                            {searchResults.map(result => (
                                                <li key={result._id}>
                                                    <Link 
                                                        to={`/user/${result._id}`} 
                                                        className="flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                        onClick={clearSearch}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-slate-800 flex items-center justify-center text-violet-600 font-bold text-sm">
                                                            {result.username?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{result.firstName} {result.lastName}</p>
                                                            <p className="text-xs text-slate-500">@{result.username}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                            {searchResults.length === 0 && !isSearchLoading && (
                                                <div className="p-4 text-center text-slate-500">No users found</div>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Desktop Auth Buttons (Modified) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* Only show Dashboard link if NOT on an inside page */}
                                {!isInsidePage && (
                                    <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600 transition-colors">
                                        Dashboard
                                    </Link>
                                )}
                                {/* Settings Link (Icon) or Avatar acting as menu trigger could go here, 
                                    but requirements just said remove logout and theme toggle. 
                                    Logout is gone. Theme toggle is gone. */}
                                <Link to="/profile" className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
                                    {user.username?.[0]?.toUpperCase()}
                                </Link>
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

                    {/* Mobile Menu Button & Search Toggle */}
                    <div className="md:hidden flex items-center space-x-4">
                        {user && (
                            <button
                                onClick={() => setIsMenuOpen(true)} // Can repurpose menu for now or add separate search modal
                                className="text-slate-600 dark:text-slate-300 hover:text-violet-600 focus:outline-none"
                            >
                                <FaSearch size={20} />
                            </button>
                        )}
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
                <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in z-40">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        <Link to="/" className="block text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/features" className="block text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link to="/pricing" className="block text-slate-600 dark:text-slate-300 font-medium hover:text-violet-600" onClick={() => setIsMenuOpen(false)}>Pricing</Link>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-3">
                             {/* Mobile Search Input */}
                             {user && (
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <FaSearch />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-200"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                    />
                                    {/* Mobile Search Results */}
                                    {(searchResults.length > 0 || isSearchLoading) && searchQuery.length > 2 && (
                                        <div className="mt-2 bg-white dark:bg-[#020617] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            {isSearchLoading ? (
                                                <div className="p-4 text-center text-slate-500">Searching...</div>
                                            ) : (
                                                <ul>
                                                    {searchResults.map(result => (
                                                        <li key={result._id}>
                                                            <Link 
                                                                to={`/user/${result._id}`} 
                                                                className="flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                                onClick={() => { clearSearch(); setIsMenuOpen(false); }}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-slate-800 flex items-center justify-center text-violet-600 font-bold text-sm">
                                                                    {result.username?.[0]?.toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{result.firstName} {result.lastName}</p>
                                                                    <p className="text-xs text-slate-500">@{result.username}</p>
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                             )}

                            {user ? (
                                <>
                                    {!isInsidePage && (
                                        <Link to="/dashboard" className="block text-center w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300" onClick={() => setIsMenuOpen(false)}>Go to Dashboard</Link>
                                    )}
                                    <Link to="/settings" className="block text-center w-full py-2 text-slate-600 dark:text-slate-300 font-medium" onClick={() => setIsMenuOpen(false)}>Settings</Link>
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
