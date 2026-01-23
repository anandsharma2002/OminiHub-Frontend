import React, { useState, useEffect, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import boardAPI from '../../api/board';
import projectAPI from '../../api/project';
import taskAPI from '../../api/task';
import { FaPlus, FaEllipsisH, FaTrash, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { usePrompt } from '../../context/PromptContext';
import { useConfirm } from '../../context/ConfirmContext';

// --- Sortable Ticket Item ---
const SortableTicket = ({ ticket, onDelete, onUpdate, members }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: ticket._id, data: { ...ticket, type: 'Ticket' } });

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (!ticket || !ticket.task) return null;

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handlePriorityChange = (level) => {
        const priorities = ['Low', 'Medium', 'High', 'Critical'];
        // level 1-4 maps to index 0-3
        onUpdate(ticket.task._id, { priority: priorities[level - 1] });
        setShowMenu(false);
    };

    const handleAssign = (userId) => {
        onUpdate(ticket.task._id, { assignedTo: userId });
        setShowMenu(false);
    };

    const handleDelete = () => {
        onDelete(ticket._id);
        setShowMenu(false);
    };

    // Helper for Priority Number
    const getPriorityNumber = (p) => {
        switch (p) {
            case 'Low': return 1;
            case 'Medium': return 2;
            case 'High': return 3;
            case 'Critical': return 4;
            default: return 0;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-3 cursor-grab hover:shadow-md transition-shadow group"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-mono">
                        #{ticket.ticketId || ticket._id.slice(-6)}
                    </span>
                </div>

                {/* 3 Dots Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={handleMenuClick}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    >
                        <FaEllipsisH />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-6 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col text-left">
                            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-500 mb-1 ml-2">Priority</p>
                                <div className="flex justify-around">
                                    {[1, 2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={(e) => { e.stopPropagation(); handlePriorityChange(num); }}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getPriorityNumber(ticket.priority) === num
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-2 border-b border-slate-100 dark:border-slate-700 max-h-32 overflow-y-auto">
                                <p className="text-xs font-bold text-slate-500 mb-1 ml-2">Assign To</p>
                                {members.length > 0 ? members.map(m => (
                                    <button
                                        key={m.user._id}
                                        onClick={(e) => { e.stopPropagation(); handleAssign(m.user._id); }}
                                        className="flex items-center w-full px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200"
                                    >
                                        <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-bold mr-2">
                                            {m.user.username[0].toUpperCase()}
                                        </div>
                                        {m.user.username}
                                    </button>
                                )) : <p className="text-xs text-slate-400 px-2">No members found</p>}
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                className="text-left w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                            >
                                <FaTrash className="mr-2" size={10} /> Remove Ticket
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{ticket.task.title}</h4>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                {/* Left: Created Date */}
                <div className="flex items-center text-xs text-slate-400" title={`Created: ${new Date(ticket.createdAt).toLocaleString()}`}>
                    <FaCalendarAlt className="mr-1 opacity-50" size={10} />
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>

                {/* Right: Assigned User */}
                <div>
                    {ticket.assignee ? (
                        <div className="flex items-center space-x-1 bg-violet-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-full border border-violet-100 dark:border-slate-600">
                            <div className="w-4 h-4 rounded-full bg-violet-500 text-white flex items-center justify-center text-[8px] font-bold">
                                {ticket.assignee.username[0].toUpperCase()}
                            </div>
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 max-w-[60px] truncate">
                                {ticket.assignee.username}
                            </span>
                        </div>
                    ) : (
                        <div className="text-[10px] text-slate-400 italic">Unassigned</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Column Component ---
const Column = ({ column, tickets, onDeleteTicket, onUpdateTicket, members, onDeleteColumn }) => {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({ id: column._id, data: { ...column, type: 'Column' } });

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = () => {
        if (tickets.length > 0) {
            if (!window.confirm("This column contains tickets. Deleting it will delete all tickets within it. Continue?")) return;
        } else {
            if (!window.confirm("Are you sure you want to delete this column?")) return;
        }
        onDeleteColumn(column._id);
    };

    return (
        <div ref={setNodeRef} style={style} className="flex-shrink-0 w-80 flex flex-col h-full bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl mr-4 border border-white/50 dark:border-slate-800 backdrop-blur-xl shadow-sm transition-all hover:shadow-md hover:border-violet-500/20 group">
            {/* Header - Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="p-4 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 cursor-grab active:cursor-grabbing touch-none"
            >
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-sm uppercase tracking-wider select-none">
                    {column.name}
                    <span className="ml-3 bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm">{tickets.length}</span>
                </h3>

                {/* Column Menu */}
                <div className="relative" ref={menuRef} onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                        <FaEllipsisH />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col text-left">
                            <button
                                onClick={handleDelete}
                                className="text-left w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                            >
                                <FaTrash className="mr-2" size={10} /> Delete Column
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-3 flex-grow overflow-y-auto pb-20 themed-scrollbar">
                <SortableContext items={tickets.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    {tickets.map(ticket => (
                        <SortableTicket
                            key={ticket._id}
                            ticket={ticket}
                            onDelete={onDeleteTicket}
                            onUpdate={onUpdateTicket}
                            members={members}
                        />
                    ))}
                </SortableContext>
                {tickets.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-900/20">
                        <span className="opacity-50 mb-1">No tickets</span>
                        <span className="text-xs opacity-40">Drop items here</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Board Component ---
const KanbanBoardComponent = ({ projectId }) => {
    const [columns, setColumns] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [members, setMembers] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { success, error: toastError } = useToast();
    const { showPrompt } = usePrompt();
    const { showConfirm } = useConfirm();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchBoard(), fetchMembers()]);
        };
        fetchData();
    }, [projectId]);

    useEffect(() => {
        if (!socket) return;

        const handleTicketDeleted = ({ ticketId, projectId: deletedProjectId }) => {
            if (deletedProjectId === projectId) {
                setTickets(prev => prev.filter(t => t._id !== ticketId));
            }
        };

        const handleTicketUpdated = (updatedTicket) => {
            if (updatedTicket.project === projectId) {
                setTickets(prev => prev.map(t => t._id === updatedTicket._id ? { ...t, ...updatedTicket } : t));
            }
        };

        const handleTaskUpdated = (updatedTask) => {
            if (updatedTask.project === projectId) {
                setTickets(prev => prev.map(t => {
                    if (t.task && t.task._id === updatedTask._id) {
                        return { ...t, task: updatedTask };
                    }
                    return t;
                }));
            }
        };

        socket.on('ticket_deleted', handleTicketDeleted);
        socket.on('ticket_updated', handleTicketUpdated);
        socket.on('task_updated', handleTaskUpdated);

        return () => {
            socket.off('ticket_deleted', handleTicketDeleted);
            socket.off('ticket_updated', handleTicketUpdated);
            socket.off('task_updated', handleTaskUpdated);
        };

    }, [socket, projectId]);

    const fetchMembers = async () => {
        try {
            const res = await projectAPI.getProject(projectId);
            const contributors = res.data.contributors || [];
            // Add owner too? Usually owner is in contributors or separate.
            // Let's assume standard contributors list. Project model usually has owner.
            // If owner is not in contributors, add them.
            const owner = res.data.owner;
            const allMembers = [...contributors];
            if (owner && !allMembers.some(c => c.user._id === owner._id)) {
                allMembers.unshift({ user: owner, role: 'Owner' });
            }
            setMembers(allMembers);
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    const fetchBoard = async () => {
        try {
            const res = await boardAPI.getBoard(projectId);
            setColumns(res.data.columns);
            setTickets(res.data.tickets.filter(t => t.task));
        } catch (error) {
            console.error("Failed to fetch board", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        const isConfirmed = await showConfirm("Are you sure you want to remove this ticket from the board?", "Remove Ticket", "danger");
        if (!isConfirmed) return;
        try {
            await boardAPI.deleteTicket(ticketId);
            setTickets(prev => prev.filter(t => t._id !== ticketId));
            success('Ticket deleted');
        } catch (error) {
            toastError("Failed to delete ticket");
        }
    };

    const handleUpdateTicket = async (taskId, updates) => {
        try {
            await taskAPI.updateTask(taskId, updates);
            // Optimistic update if needed, but socket will handle it
        } catch (error) {
            toastError("Failed to update ticket");
        }
    };

    const handleDeleteColumn = async (columnId) => {
        const column = columns.find(c => c._id === columnId);
        if (!column) return;

        let message = "Are you sure you want to delete this column?";
        const ticketsInCol = tickets.filter(t => t.column === columnId);
        if (ticketsInCol.length > 0) {
            message = "This column contains tickets. Deleting it will delete all tickets within it. Continue?";
        }

        const isConfirmed = await showConfirm(message, "Delete Column", "danger");
        if (!isConfirmed) return;

        try {
            await boardAPI.deleteColumn(columnId);
            setColumns(prev => prev.filter(c => c._id !== columnId));
            setTickets(prev => prev.filter(t => t.column !== columnId));
            success('Column deleted');
        } catch (error) {
            toastError("Failed to delete column");
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Handle Column Dragging
        const isActiveColumn = active.data.current?.type === 'Column';
        if (isActiveColumn) {
            if (activeId !== overId) {
                setColumns((columns) => {
                    const oldIndex = columns.findIndex((c) => c._id === activeId);
                    const newIndex = columns.findIndex((c) => c._id === overId);
                    return arrayMove(columns, oldIndex, newIndex);
                });

                // Calculate new index to send to backend
                const oldIndex = columns.findIndex(c => c._id === activeId);
                const newIndex = columns.findIndex(c => c._id === overId); // Note: this uses closure 'columns' which might be stale in setter? No, use the computed values.
                // Wait, I should calculate indices BEFORE setter or use the setter to derive logic but I need to call API.
                // Re-calculating indices from current state 'columns' is fine for the API call payload since it represents the state BEFORE the move effectively if I use it here, 
                // BUT I need the TARGET index. 
                // Actually arrayMove(columns, oldIndex, newIndex) returns the new array.
                // The backend API expects just the new position index (integer).

                try {
                    // Correct way:
                    const oldIdx = columns.findIndex(c => c._id === activeId);
                    const newIdx = columns.findIndex(c => c._id === overId);

                    await boardAPI.moveColumn({
                        columnId: activeId,
                        newOrder: newIdx
                    });
                } catch (error) {
                    console.error("Move column failed", error);
                    fetchBoard();
                }
            }
            return;
        }

        const activeTicket = tickets.find(t => t._id === activeId);

        if (activeTicket) {
            let newColumnId = null;
            const overColumn = columns.find(c => c._id === overId);
            if (overColumn) {
                newColumnId = overColumn._id;
            } else {
                const overTicket = tickets.find(t => t._id === overId);
                if (overTicket) {
                    newColumnId = overTicket.column;
                }
            }

            if (newColumnId && newColumnId !== activeTicket.column) {
                setTickets(tickets => tickets.map(t =>
                    t._id === activeId ? { ...t, column: newColumnId } : t
                ));

                try {
                    await boardAPI.moveTicket({
                        ticketId: activeId,
                        newColumnId: newColumnId,
                        newOrder: 0
                    });
                } catch (error) {
                    console.error("Move failed", error);
                    fetchBoard();
                }
            }
        }
    };

    const createColumn = async () => {
        const name = await showPrompt("Enter column name:", "", "e.g., In Progress");
        if (name) {
            try {
                await boardAPI.createColumn({ projectId, name });
                // Socket update expected
                success('Column created');
            } catch (error) {
                toastError("Failed to create column");
            }
        }
    };

    if (loading) return <div>Loading board...</div>;

    const activeColumn = activeId ? columns.find(c => c._id === activeId) : null;

    return (
        <div className="h-[calc(100vh-180px)] overflow-x-auto overflow-y-hidden pb-4 themed-scrollbar">
            <div className="flex h-full px-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={columns.map(c => c._id)} strategy={horizontalListSortingStrategy}>
                        {columns.map(col => (
                            <Column
                                key={col._id}
                                column={col}
                                tickets={tickets.filter(t => t.column === col._id)}
                                onDeleteTicket={handleDeleteTicket}
                                onUpdateTicket={handleUpdateTicket}
                                members={members}
                                onDeleteColumn={handleDeleteColumn}
                            />
                        ))}
                    </SortableContext>

                    <div className="flex-shrink-0 w-72 h-14 bg-white/50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors mx-2" onClick={createColumn}>
                        <div className="text-slate-500 font-medium flex items-center">
                            <FaPlus className="mr-2" /> Add Column
                        </div>
                    </div>

                    <DragOverlay>
                        {activeId ? (
                            activeColumn ? (
                                <div className="w-80 h-full bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border-2 border-violet-500 shadow-2xl backdrop-blur-xl opacity-90 rotate-3 cursor-grabbing p-4">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-sm uppercase tracking-wider mb-2">
                                        {activeColumn.name}
                                        <span className="ml-3 bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm">
                                            {tickets.filter(t => t.column === activeColumn._id).length}
                                        </span>
                                    </h3>
                                    <div className="h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-xl"></div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border-2 border-violet-500 cursor-grabbing opacity-90 rotate-3 text-sm font-bold">
                                    Dragging ticket...
                                </div>
                            )
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

export default KanbanBoardComponent;
