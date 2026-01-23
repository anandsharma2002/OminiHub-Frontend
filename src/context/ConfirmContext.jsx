import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmContext = createContext();

export const useConfirm = () => {
    return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState({
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'warning' // warning, danger, info
    });

    // We store the resolve/reject functions of the current promise
    const promiseRef = useRef(null);

    const showConfirm = useCallback((message, title = 'Confirm Action', type = 'warning') => {
        return new Promise((resolve) => {
            setOptions({
                title,
                message,
                confirmText: 'Confirm',
                cancelText: 'Cancel',
                type
            });
            setIsOpen(true);
            promiseRef.current = { resolve };
        });
    }, []);

    const handleConfirm = () => {
        if (promiseRef.current) {
            promiseRef.current.resolve(true);
        }
        setIsOpen(false);
        promiseRef.current = null;
    };

    const handleCancel = () => {
        if (promiseRef.current) {
            promiseRef.current.resolve(false);
        }
        setIsOpen(false);
        promiseRef.current = null;
    };

    return (
        <ConfirmContext.Provider value={{ showConfirm }}>
            {children}
            {isOpen && (
                <ConfirmModal
                    options={options}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    );
};

const ConfirmModal = ({ options, onConfirm, onCancel }) => {
    // Prevent scrolling when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const getIcon = () => {
        switch (options.type) {
            case 'danger': return <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><FaExclamationTriangle className="h-6 w-6 text-red-600" /></div>;
            case 'info': return <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"><FaExclamationTriangle className="h-6 w-6 text-blue-600" /></div>;
            case 'warning': default: return <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10"><FaExclamationTriangle className="h-6 w-6 text-amber-600" /></div>;
        }
    };

    const getConfirmBtnColor = () => {
        switch (options.type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'info': return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
            case 'warning': default: return 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500';
        }
    };

    return (
        <div className="relative z-[10000]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity animate-fade-in"></div>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-800 animate-scale-up">
                        <div className="bg-white dark:bg-slate-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                {getIcon()}
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white" id="modal-title">
                                        {options.title}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {options.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                className={`inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-all ${getConfirmBtnColor()}`}
                                onClick={onConfirm}
                            >
                                {options.confirmText}
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 sm:mt-0 sm:w-auto transition-all"
                                onClick={onCancel}
                            >
                                {options.cancelText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
