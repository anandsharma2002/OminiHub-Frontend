import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaPlus, FaSearch, FaBars } from 'react-icons/fa';
import docsApi from '../api/docs';
import DocumentCard from '../components/documents/DocumentCard';
import AddDocumentModal from '../components/documents/AddDocumentModal';
import EditDocumentModal from '../components/documents/EditDocumentModal';
import { useSocket } from '../context/SocketContext';

const Documents = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const { setSidebarOpen } = useOutletContext();
    const { socket } = useSocket();

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const data = await docsApi.getDocuments();
            setDocs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    // Real-time Updates
    useEffect(() => {
        if (!socket) return;

        const handleDocUpdate = (data) => {
            const { action, doc, docId } = data;

            setDocs(prevDocs => {
                if (action === 'create') {
                    // Prepend new doc
                    return [doc, ...prevDocs];
                } else if (action === 'update') {
                    // Replace existing doc
                    return prevDocs.map(d => d._id === doc._id ? doc : d);
                } else if (action === 'delete') {
                    // Filter out deleted doc
                    return prevDocs.filter(d => d._id !== docId);
                }
                return prevDocs;
            });
        };

        socket.on('document_update', handleDocUpdate);

        return () => {
            socket.off('document_update', handleDocUpdate);
        };
    }, [socket]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await docsApi.deleteDocument(id);
                setDocs(docs.filter(d => d._id !== id));
            } catch (error) {
                alert('Failed to delete: ' + error);
            }
        }
    };

    const handleUpdate = (doc) => {
        setEditingDoc(doc);
        setIsEditModalOpen(true);
    };

    const filteredDocs = docs.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center">
                    <button
                        className="md:hidden mr-4 text-slate-600 dark:text-slate-300 hover:text-violet-600"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FaBars size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Documents
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Manage your files and resources securely.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative hidden sm:block">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-10 py-2.5 w-64"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FaPlus />
                        <span>Add Document</span>
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="relative sm:hidden mb-6">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10 py-2.5"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="card-glass h-48 animate-pulse">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <DocumentCard
                            key={doc._id}
                            doc={doc}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="inline-block p-4 bg-violet-100 dark:bg-violet-900/30 rounded-full mb-4 text-violet-600 dark:text-violet-400">
                        <FaPlus size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No documents found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Get started by uploading your first document using the button above.
                    </p>
                </div>
            )}

            <AddDocumentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchDocs}
            />

            <EditDocumentModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingDoc(null);
                }}
                onSuccess={fetchDocs}
                doc={editingDoc}
            />
        </div>
    );
};

export default Documents;
