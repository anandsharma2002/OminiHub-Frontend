import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none
                ${isDark ? 'bg-slate-700 shadow-inner' : 'bg-gradient-to-r from-blue-200 to-sky-200 shadow-inner'}
            `}
            aria-label="Toggle Dark Mode"
        >
            {/* Sliding Toggle Circle */}
            <div
                className={`
                    absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center
                    ${isDark ? 'translate-x-8 bg-slate-800' : 'translate-x-0 bg-white'}
                `}
            >
                {/* Icon Rendering with Rotation/Scale Animation */}
                <div className="relative w-full h-full flex items-center justify-center text-xs">
                    <FaSun
                        className={`absolute transition-all duration-300 ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0 text-amber-500'}`}
                    />
                    <FaMoon
                        className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 scale-100 rotate-0 text-violet-400' : 'opacity-0 scale-50 -rotate-90'}`}
                    />
                </div>
            </div>

            {/* Background Decorations (Optional star/cloud hints) */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none text-[10px] opacity-50">
                <span className={`transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100 text-sky-600'}`}>☀️</span>
                <span className={`transition-opacity duration-300 ${isDark ? 'opacity-100 text-slate-400' : 'opacity-0'}`}>🌙</span>
            </div>
        </button>
    );
};

export default ThemeToggle;
