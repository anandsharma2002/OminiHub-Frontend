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
import { FaPlus, FaEllipsisH, FaTrash, FaCalendarAlt, FaUserCircle, FaSortAmountDown } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { usePrompt } from '../../context/PromptContext';
import { useConfirm } from '../../context/ConfirmContext';



// --- Pure Presentation Ticket Component ---
const TicketCard = ({ ticket, members, style, className, showMenuButton = true, onMenuClick, showMenu, menuContent, onDelete, onUpdate, buttonRef }) => {
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

    const getPriorityColor = (p) => {
        switch (p) {
            case 'Low': return 'bg-slate-200 text-slate-700'; // Grey
            case 'Medium': return 'bg-blue-100 text-blue-700'; // Blue
            case 'High': return 'bg-orange-100 text-orange-700'; // Orange
            case 'Critical': return 'bg-red-100 text-red-700'; // Red
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const pNum = getPriorityNumber(ticket.priority);

    return (
        <div
            style={style}
            className={`relative bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-3 cursor-grab hover:shadow-md transition-shadow group ${className || ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-mono">
                        #{ticket.ticketId || ticket._id.slice(-6)}
                    </span>
                </div>

                {/* 3 Dots Menu */}
                {showMenuButton && (
                    <div className="relative">
                        <button
                            ref={buttonRef}
                            onPointerDown={(e) => { e.stopPropagation(); onMenuClick && onMenuClick(e); }} // Use onPointerDown to prevent drag start
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                        >
                            <FaEllipsisH />
                        </button>
                        {showMenu && menuContent}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight flex-grow pr-2">{ticket.task.title}</h4>
                {pNum > 0 && (
                    <div className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(ticket.priority)}`} title={`Priority: ${ticket.priority}`}>
                        P{pNum}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 font-mono">
                    #{ticket.ticketId || ticket._id.slice(-6)}
                </span>
            </div>

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

// --- Sortable Ticket Item ---
const SortableTicket = ({ ticket, onDelete, onUpdate, members }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: ticket._id, data: { ...ticket, type: 'Ticket' } });

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Dim original when dragging
    };

    if (!ticket || !ticket.task) return null;

    const handleMenuClick = (e) => {
        // e.stopPropagation() is handled in TicketCard onPointerDown
        setShowMenu(!showMenu);
    };

    const handlePriorityChange = (level) => {
        const priorities = ['Low', 'Medium', 'High', 'Critical'];
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

    const getPriorityNumber = (p) => {
        switch (p) {
            case 'Low': return 1;
            case 'Medium': return 2;
            case 'High': return 3;
            case 'Critical': return 4;
            default: return 0;
        }
    };

    const menuContent = (
        <div ref={menuRef} className="absolute right-0 top-6 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col text-left">
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
                        className="flex items-center w-full px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 overflow-hidden"
                    >
                        <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-bold mr-2 shrink-0">
                            {m.user.username[0].toUpperCase()}
                        </div>
                        <span className="truncate">{m.user.username}</span>
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
    );

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TicketCard
                ticket={ticket}
                members={members}
                showMenu={showMenu}
                showMenuButton={true}
                onMenuClick={handleMenuClick}
                menuContent={menuContent}
                buttonRef={buttonRef}
            />
        </div>
    );
};

// --- Column Component ---
const Column = ({ column, tickets, onDeleteTicket, onUpdateTicket, members, onDeleteColumn, isDragOver, confirm }) => {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({ id: column._id, data: { ...column, type: 'Column' } });

    const [showMenu, setShowMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [sortMode, setSortMode] = useState('manual'); // 'manual', 'priority', 'date'
    const menuRef = useRef(null);
    const sortMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
                setShowSortMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getPriorityValue = (p) => {
        switch (p) {
            case 'Critical': return 4;
            case 'High': return 3;
            case 'Medium': return 2;
            case 'Low': return 1;
            default: return 0;
        }
    };

    const sortedTickets = React.useMemo(() => {
        let sorted = [...tickets];
        if (sortMode === 'priority') {
            sorted.sort((a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority));
        } else if (sortMode === 'date') {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return sorted;
    }, [tickets, sortMode]);

    const handleSortChange = (mode) => {
        setSortMode(mode);
        setShowSortMenu(false);
    };

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = async () => {
        let message = "Are you sure you want to delete this column?";
        if (tickets.length > 0) {
            message = "This column contains tickets. Deleting it will delete all tickets within it. Continue?";
        }

        const isConfirmed = await confirm(message, "Delete Column", "danger");
        if (!isConfirmed) return;

        onDeleteColumn(column._id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex-shrink-0 w-80 flex flex-col h-full rounded-2xl mr-4 backdrop-blur-xl shadow-sm transition-all group
                ${isDragOver
                    ? 'bg-violet-50/90 dark:bg-slate-900/80 border-2 border-violet-500 shadow-violet-500/20 shadow-lg'
                    : 'bg-slate-100/80 dark:bg-slate-900/60 border border-white/50 dark:border-slate-800 hover:shadow-md hover:border-violet-500/20'
                }
            `}
        >
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

                {/* Sort Menu */}
                <div className="relative mr-2" ref={sortMenuRef} onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className={`transition-colors p-1 rounded-md ${sortMode !== 'manual' ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                        title="Sort Tickets"
                    >
                        <FaSortAmountDown />
                    </button>
                    {showSortMenu && (
                        <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col text-left">
                            <button
                                onClick={() => handleSortChange('manual')}
                                className={`text-left w-full px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 ${sortMode === 'manual' ? 'font-bold text-violet-600' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                Default (Manual)
                            </button>
                            <button
                                onClick={() => handleSortChange('priority')}
                                className={`text-left w-full px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 ${sortMode === 'priority' ? 'font-bold text-violet-600' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                Priority (High-Low)
                            </button>
                            <button
                                onClick={() => handleSortChange('date')}
                                className={`text-left w-full px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 ${sortMode === 'date' ? 'font-bold text-violet-600' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                Created (Newest)
                            </button>
                        </div>
                    )}
                </div>
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

            <div className="p-3 flex-grow overflow-y-auto pb-20 scrollbar-hide">
                <SortableContext items={sortedTickets.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    {sortedTickets.map(ticket => (
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
    const [overColumnId, setOverColumnId] = useState(null); // Track formatted column hover
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

        const handleTicketCreated = (newTicket) => {
            if (newTicket.project === projectId) {
                setTickets(prev => [...prev, newTicket]);
            }
        };

        const handleColumnCreated = (newColumn) => {
            if (newColumn.project === projectId) {
                setColumns(prev => [...prev, newColumn]);
            }
        };

        const handleColumnDeleted = ({ columnId, projectId: pId }) => {
            if (pId === projectId) {
                setColumns(prev => prev.filter(c => c._id !== columnId));
                setTickets(prev => prev.filter(t => t.column !== columnId));
            }
        };

        const handleColumnsReordered = ({ projectId: pId, columns: newColumns }) => {
            if (pId === projectId) {
                setColumns(newColumns);
            }
        };

        socket.on('ticket_deleted', handleTicketDeleted);
        socket.on('ticket_updated', handleTicketUpdated);
        socket.on('task_updated', handleTaskUpdated);
        socket.on('ticket_created', handleTicketCreated);
        socket.on('column_created', handleColumnCreated);
        socket.on('column_deleted', handleColumnDeleted);
        socket.on('columns_reordered', handleColumnsReordered);

        socket.on('board_refetch_needed', ({ projectId: pId }) => {
            if (pId === projectId) {
                fetchBoard();
            }
        });

        return () => {
            socket.off('ticket_deleted', handleTicketDeleted);
            socket.off('ticket_updated', handleTicketUpdated);
            socket.off('task_updated', handleTaskUpdated);
            socket.off('ticket_created', handleTicketCreated);
            socket.off('column_created', handleColumnCreated);
            socket.off('column_deleted', handleColumnDeleted);
            socket.off('columns_reordered', handleColumnsReordered);
            socket.off('board_refetch_needed');
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
            setColumns(prev => prev.filter(c => c._id !== columnId));
            setTickets(prev => prev.filter(t => t.column !== columnId));
            success('Column deleted');
        } catch (error) {
            toastError("Failed to delete column");
        }
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) {
            setOverColumnId(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        // Determine Over Column (for styling)
        const overTicket = tickets.find(t => t._id === overId);
        const overColumn = columns.find(c => c._id === overId);
        let destColumnId = null;

        if (overTicket) {
            destColumnId = overTicket.column;
        } else if (overColumn) {
            destColumnId = overColumn._id;
        }
        setOverColumnId(destColumnId);

        // Find dragged ticket
        const activeTicket = tickets.find(t => t._id === activeId);
        if (!activeTicket) return; // Only handle tickets in DragOver

        const isActiveColumn = active.data.current?.type === 'Column';
        if (isActiveColumn) return; // Columns handled in DragEnd

        // Identify Source Column
        const sourceColumnId = activeTicket.column;

        // If no destination or same column, return (Same column handled by DragEnd for final reorder)
        if (!destColumnId || sourceColumnId === destColumnId) return;

        // PERFORM OPTIMISTIC UPDATE
        setTickets(prev => {
            const activeIndex = prev.findIndex(t => t._id === activeId);
            const updated = [...prev];

            // Update column
            if (activeIndex !== -1) {
                updated[activeIndex] = { ...updated[activeIndex], column: destColumnId };
            }

            return updated;
        });
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        setOverColumnId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Handle Column Dragging
        const isActiveColumn = active.data.current?.type === 'Column';
        if (isActiveColumn) {
            if (activeId !== overId) {
                const oldIndex = columns.findIndex((c) => c._id === activeId);
                const newIndex = columns.findIndex((c) => c._id === overId);

                setColumns((columns) => arrayMove(columns, oldIndex, newIndex));

                try {
                    await boardAPI.moveColumn({
                        columnId: activeId,
                        newOrder: newIndex
                    });
                } catch (error) {
                    console.error("Move column failed", error);
                    fetchBoard();
                }
            }
            return;
        }

        // Handle Ticket Dragging (Final Persistence)
        const activeTicket = tickets.find(t => t._id === activeId);
        if (!activeTicket) return;

        // activeTicket.column is already updated by DragOver 
        const currentColumnId = activeTicket.column;

        // Find order
        const ticketsInColumn = tickets.filter(t => t.column === currentColumnId);
        const oldIndex = ticketsInColumn.findIndex(t => t._id === activeId);

        let newIndex = ticketsInColumn.length - 1;

        const overTicket = tickets.find(t => t._id === overId);
        // If we dropped on a ticket in the same column (which it should be now)
        if (overTicket && overTicket.column === currentColumnId) {
            newIndex = ticketsInColumn.findIndex(t => t._id === overId);
        } else if (overTicket) {
            // Fallback if mismatch
            newIndex = ticketsInColumn.findIndex(t => t._id === overTicket._id);
            if (newIndex === -1) newIndex = ticketsInColumn.length - 1;
        }

        // Reorder visually if needed (although DragOver might have done it or standard sortable did)
        if (oldIndex !== newIndex) {
            const newOrderedSub = arrayMove(ticketsInColumn, oldIndex, newIndex);
            setTickets(prev => {
                const others = prev.filter(t => t.column !== currentColumnId);
                return [...others, ...newOrderedSub];
            });
        }

        try {
            await boardAPI.moveTicket({
                ticketId: activeId,
                newColumnId: currentColumnId,
                newOrder: newIndex
            });
        } catch (error) {
            console.error("Move ticket failed", error);
            fetchBoard();
        }
    };

    const createColumn = async () => {
        const name = await showPrompt("Enter column name:", "", "e.g., In Progress");
        if (name) {
            try {
                await boardAPI.createColumn({ projectId, name });
                fetchBoard();
                success('Column created');
            } catch (error) {
                toastError("Failed to create column");
            }
        }
    };

    if (loading) return <div>Loading board...</div>;

    const activeColumn = activeId ? columns.find(c => c._id === activeId) : null;
    const activeTicket = activeId ? tickets.find(t => t._id === activeId) : null;

    return (
        <div className="h-[calc(100vh-180px)] overflow-x-auto overflow-y-hidden pb-4 themed-scrollbar">
            <div className="flex h-full px-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
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
                                isDragOver={overColumnId === col._id}
                                confirm={showConfirm}
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
                            ) : activeTicket ? (
                                <div className="cursor-grabbing w-[300px]">
                                    <TicketCard
                                        ticket={activeTicket}
                                        members={members}
                                        showMenuButton={false}
                                        className="shadow-2xl border-violet-500/50 ring-2 ring-violet-500/20"
                                    />
                                </div>
                            ) : null
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

export default KanbanBoardComponent;
