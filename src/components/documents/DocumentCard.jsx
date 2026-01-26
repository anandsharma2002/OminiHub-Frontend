import React, { useState } from 'react';
import { FaFilePdf, FaFileImage, FaFileAlt, FaDownload, FaTrash, FaPen, FaLock, FaGlobe } from 'react-icons/fa';
import docsApi from '../../api/docs';
import { useToast } from '../../context/ToastContext';

const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FaFilePdf className="text-red-500 text-3xl" />;
    if (mimeType.includes('image')) return <FaFileImage className="text-blue-500 text-3xl" />;
    return <FaFileAlt className="text-slate-500 text-3xl" />;
};

const DocumentCard = ({ doc, onDelete, onUpdate, allowDownload = true }) => {
    const [downloading, setDownloading] = useState(false);
    const { error: toastError } = useToast();

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const url = await docsApi.downloadDocument(doc._id);
            window.open(url, '_blank');
        } catch (error) {
            toastError('Failed to download: ' + error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="card-glass p-5 flex flex-col h-full hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        {getFileIcon(doc.fileType || '')}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white line-clamp-1" title={doc.name}>
                            {doc.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                                {doc.privacy === 'private' ? <FaLock size={10} /> : <FaGlobe size={10} />}
                                <span className="capitalize">{doc.privacy}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 flex-1">
                {doc.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                    {!doc.readOnly && (
                        <>
                            <button
                                onClick={() => onUpdate(doc)}
                                className="p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/30"
                                title="Edit"
                            >
                                <FaPen size={14} />
                            </button>
                            <button
                                onClick={() => onDelete(doc._id)}
                                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Delete"
                            >
                                <FaTrash size={14} />
                            </button>
                        </>
                    )}
                </div>

                {allowDownload && (
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50"
                    >
                        {downloading ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <FaDownload size={14} />
                                <span>Download</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DocumentCard;
