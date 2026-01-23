import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
    const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
    const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);
    const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);

    const value = {
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col space-y-2 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ id, message, type, duration, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(id), 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, id, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(id), 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-violet-500" />;
            case 'error': return <FaExclamationCircle className="text-red-500" />;
            case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
            case 'info': default: return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success': return 'bg-white dark:bg-slate-800 border-violet-500';
            case 'error': return 'bg-white dark:bg-slate-800 border-red-500';
            case 'warning': return 'bg-white dark:bg-slate-800 border-yellow-500';
            case 'info': default: return 'bg-white dark:bg-slate-800 border-blue-500';
        }
    };

    return (
        <div
            className={`
                pointer-events-auto
                flex items-center min-w-[300px] max-w-[400px] p-4 rounded-xl shadow-lg border-l-4
                transform transition-all duration-300 ease-in-out
                ${getStyles()}
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
        >
            <div className="flex-shrink-0 mr-3 text-xl">
                {getIcon()}
            </div>
            <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {message}
            </div>
            <button
                onClick={handleClose}
                className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
                <FaTimes />
            </button>
        </div>
    );
};
