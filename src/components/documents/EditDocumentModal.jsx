import React, { useState, useEffect } from 'react';
import { FaTimes, FaLock, FaGlobe } from 'react-icons/fa';
import docsApi from '../../api/docs';

const EditDocumentModal = ({ isOpen, onClose, onSuccess, doc }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('private');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (doc) {
            setName(doc.name || '');
            setDescription(doc.description || '');
            setPrivacy(doc.privacy || 'private');
        }
    }, [doc]);

    if (!isOpen || !doc) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try {
            await docsApi.updateDocument(doc._id, {
                name,
                description,
                privacy
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err || 'Failed to update document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Document</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter document name"
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter brief description"
                            className="input-field min-h-[80px] resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Privacy</label>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border transition-all ${privacy === 'private'
                                    ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-500 text-violet-700 dark:text-violet-300'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <FaLock size={14} />
                                <span>Private</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border transition-all ${privacy === 'public'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <FaGlobe size={14} />
                                <span>Public</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Updating...' : 'Update Document'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditDocumentModal;
