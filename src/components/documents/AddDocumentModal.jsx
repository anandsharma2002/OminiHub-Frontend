import React, { useState, useRef } from 'react';
import { FaTimes, FaCloudUploadAlt, FaLock, FaGlobe, FaFile, FaFilePdf, FaFileImage } from 'react-icons/fa';
import docsApi from '../../api/docs';

const AddDocumentModal = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('private');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        if (!name) {
            // Auto-fill name from file name (removing extension)
            const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
            setName(fileName);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name || file.name);
        formData.append('description', description);
        formData.append('privacy', privacy);

        setLoading(true);

        try {
            await docsApi.uploadDocument(formData);
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err || 'Failed to uploads document');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setPrivacy('private');
        setFile(null);
        setError('');
        onClose();
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return <FaCloudUploadAlt className="text-4xl text-slate-400 group-hover:text-violet-500 transition-colors" />;
        if (fileName.endsWith('.pdf')) return <FaFilePdf className="text-4xl text-red-500" />;
        if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) return <FaFileImage className="text-4xl text-blue-500" />;
        return <FaFile className="text-4xl text-slate-500" />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all animate-scale-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Upload Document
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Add a new file to your secure workspace
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-3 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center animate-shake">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    {/* Drag & Drop File Input */}
                    <div
                        className={`relative group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${dragActive || file
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10 scale-[1.01]'
                            : 'border-slate-300 dark:border-slate-700 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleChange}
                            className="hidden"
                        />

                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <div className={`mb-3 transition-transform duration-300 ${dragActive || file ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {getFileIcon(file?.name)}
                            </div>

                            {file ? (
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-white truncate max-w-[250px]">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <p className="text-xs text-violet-600 dark:text-violet-400 mt-2 font-medium hover:underline">
                                        Click or drop to replace
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="mb-2 text-sm text-slate-700 dark:text-slate-200 font-medium">
                                        <span className="font-semibold text-violet-600 dark:text-violet-400">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        PDF, Images, or Text files (max 10MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Document Details */}
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Document Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Q3 Financial Report"
                                className="input-field w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a brief description about this file..."
                                className="input-field w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none min-h-[80px] resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Privacy Settings</label>
                            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setPrivacy('private')}
                                    className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${privacy === 'private'
                                        ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <FaLock size={12} />
                                    <span>Private</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrivacy('public')}
                                    className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${privacy === 'public'
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <FaGlobe size={12} />
                                    <span>Public</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 ml-1 text-center">
                                {privacy === 'private'
                                    ? 'Only you can view and download this file.'
                                    : 'Anyone with the link can view this file.'}
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-lg shadow-violet-500/20 transition-all duration-200 flex items-center justify-center space-x-2 ${loading
                                ? 'bg-violet-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:shadow-violet-500/30'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <FaCloudUploadAlt className="text-lg" />
                                    <span>Upload Document</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDocumentModal;
