import React, { useState, useEffect } from 'react';
import docAPI from '../../api/docs';
import DocumentCard from '../documents/DocumentCard';
import EditDocumentModal from '../documents/EditDocumentModal';
import { useSocket } from '../../context/SocketContext';
import { FaFileAlt } from 'react-icons/fa';
import { useConfirm } from '../../context/ConfirmContext';

const DocumentsSection = ({ userId, isOwner, allowAction = true, allowDownload = true, showPrivate = true }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDoc, setEditDoc] = useState(null);
    const { socket } = useSocket();
    const { showConfirm } = useConfirm();

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    useEffect(() => {
        if (!socket || !userId) return;

        // Listener for real-time document updates
        const handleDocumentUpdate = ({ action, doc, docId }) => {
            console.log("Real-time Doc Update:", action, doc, docId);
            if (action === 'create') {
                const shouldShow = isOwner || doc.privacy === 'public';
                if (shouldShow) {
                    setDocuments(prev => [doc, ...prev]);
                }
            } else if (action === 'update') {
                setDocuments(prev => {
                    if (!doc) return prev;
                    const isVisible = isOwner || doc.privacy === 'public';
                    if (!isVisible) {
                        return prev.filter(d => d._id !== doc._id);
                    }
                    const exists = prev.find(d => d._id === doc._id);
                    if (exists) {
                        return prev.map(d => d._id === doc._id ? doc : d);
                    } else {
                        return [doc, ...prev];
                    }
                });
            } else if (action === 'delete') {
                setDocuments(prev => prev.filter(d => d._id !== docId));
            }
        };

        socket.on('document_update', handleDocumentUpdate);

        return () => {
            socket.off('document_update', handleDocumentUpdate);
        };
    }, [socket, userId, isOwner]);

    const fetchDocuments = async () => {
        try {
            const res = await docAPI.getDocuments(userId);
            setDocuments(res || []);
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId) => {
        const isConfirmed = await showConfirm("Are you sure you want to delete this document?", "Delete Document", "danger");
        if (!isConfirmed) return;
        try {
            await docAPI.deleteDocument(docId);
            // Optimistic update
            setDocuments(prev => prev.filter(d => d._id !== docId));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleUpdate = (doc) => {
        setEditDoc(doc);
    };

    const handleUpdateSuccess = () => {
        // Socket will handle the update
        fetchDocuments(); // Refresh to be sure
    };

    if (loading) return <div className="text-center p-4 text-slate-500 animate-pulse">Loading documents...</div>;

    const visibleDocuments = documents.filter(doc => showPrivate || doc.privacy !== 'private');

    if (visibleDocuments.length === 0) {
        if (isOwner && showPrivate) return (
            <div className="card-glass p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500">
                <FaFileAlt className="text-4xl mb-2 opacity-20" />
                <p>You haven't uploaded any documents yet.</p>
            </div>
        );
        return null;
    }

    return (
        <div className="card-glass p-6">
            <div className="flex items-center space-x-3 mb-4">
                <FaFileAlt className="text-xl text-violet-600 dark:text-violet-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Documents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleDocuments.map(doc => (
                    <DocumentCard
                        key={doc._id}
                        doc={{ ...doc, readOnly: !(isOwner && allowAction) }}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        allowDownload={allowDownload}
                    />
                ))}
            </div>

            {editDoc && (
                <EditDocumentModal
                    isOpen={!!editDoc}
                    doc={editDoc}
                    onClose={() => setEditDoc(null)}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default DocumentsSection;
