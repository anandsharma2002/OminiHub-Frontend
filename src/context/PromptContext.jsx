import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const PromptContext = createContext();

export const usePrompt = () => {
    return useContext(PromptContext);
};

export const PromptProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [defaultValue, setDefaultValue] = useState('');
    const [placeholder, setPlaceholder] = useState('');

    // We store the resolve/reject functions of the current promise
    const promiseRef = useRef(null);

    const showPrompt = useCallback((message, initialValue = '', placeHold = '') => {
        return new Promise((resolve, reject) => {
            setTitle(message);
            setDefaultValue(initialValue);
            setPlaceholder(placeHold);
            setIsOpen(true);
            promiseRef.current = { resolve, reject };
        });
    }, []);

    const handleConfirm = (value) => {
        if (promiseRef.current) {
            promiseRef.current.resolve(value);
        }
        setIsOpen(false);
        promiseRef.current = null;
    };

    const handleCancel = () => {
        if (promiseRef.current) {
            promiseRef.current.resolve(null); // Resolve with null on cancel
        }
        setIsOpen(false);
        promiseRef.current = null;
    };

    return (
        <PromptContext.Provider value={{ showPrompt }}>
            {children}
            {isOpen && (
                <PromptModal
                    title={title}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </PromptContext.Provider>
    );
};

const PromptModal = ({ title, defaultValue, placeholder, onConfirm, onCancel }) => {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(value);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 transform transition-all scale-100 animate-scale-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <FaTimes size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all mb-6"
                    />

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary px-6 py-2.5 shadow-lg shadow-violet-500/20"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
