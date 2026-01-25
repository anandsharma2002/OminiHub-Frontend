import React, { useState, useEffect } from 'react';
import taskAPI from '../../api/task';
import boardAPI from '../../api/board';
import { FaPlus, FaCheckCircle, FaCircle, FaChevronRight, FaChevronDown, FaTrash, FaTicketAlt, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

// Recursive Task Item Component
const TaskItem = ({ task, allTasks, level, onDelete, onUpdate, onConvert, onAddSub, onShowForm, showCreateForm, onAddSubmit, onCancelForm, newTaskState, setNewTaskState }) => {
    const [isOpen, setIsOpen] = useState(false); // Default collapsed
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);

    // Find direct children
    const children = allTasks.filter(t => t.parentTask === task._id);
    const hasChildren = children.length > 0;

    // Auto-expand if adding a child to this item
    useEffect(() => {
        if (showCreateForm?.parentId === task._id) {
            setIsOpen(true);
        }
    }, [showCreateForm, task._id]);

    const isCollapsible = (task.type === 'Heading' || task.type === 'Sub-Heading');

    const handleToggle = (e) => {
        // Prevent toggle if clicking buttons
        if (e.target.closest('button') || e.target.closest('form') || e.target.closest('input')) return;
        if (isCollapsible) setIsOpen(!isOpen);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        onUpdate(task._id, { title: editTitle });
        setIsEditing(false);
    };

    const isHeading = task.type === 'Heading';

    return (
        <div className={`
            ${isHeading ? 'mb-4' : 'mb-2'} 
            ${isHeading ? 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden' : ''}
            select-none transition-all
        `}>
            {/* Task Row */}
            <div
                className={`
                    group flex items-center justify-between p-3 transition-colors cursor-pointer
                    ${!isHeading ? 'rounded-lg border' : ''}
                    ${isHeading ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''}
                    ${task.type === 'Heading' ? 'font-bold text-lg text-slate-800 dark:text-slate-100' : ''}
                    ${task.type === 'Sub-Heading' ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 font-semibold ml-4' : ''}
                    
                    /* Level 1 Tasks (Direct under Heading) */
                    ${task.type === 'Task' && level === 1 ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-violet-300 ml-4 border-l-4 border-l-violet-500 shadow-sm' : ''}
                    
                    /* Level 2 Tasks (Under Sub-Heading) */
                    ${task.type === 'Task' && level > 1 ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-violet-200 ml-12' : ''}
                    
                    ${task.type === 'Task' ? 'cursor-default' : ''}
                `}
                onClick={handleToggle}
            >
                <div className={`flex items-center space-x-3 overflow-hidden ${task.ticket?.column?.name?.toLowerCase()?.includes('closed') ? 'opacity-50' : ''}`}>
                    {/* Actions Left (Delete) */}
                    <button
                        onClick={() => onDelete(task._id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                    >
                        <FaTrash size={14} />
                    </button>

                    {/* Toggle Icon or Status Icon */}
                    {isCollapsible ? (
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isOpen ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' : 'text-slate-400'}`}>
                            {isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                        </div>
                    ) : (
                        <div className="text-slate-400 hover:text-green-500 cursor-pointer w-5 flex justify-center">
                            {task.status === 'Done' ? <FaCheckCircle className="text-green-500" /> : <FaCircle size={10} />}
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} className="flex-1 flex items-center space-x-2">
                            <input
                                autoFocus
                                type="text"
                                className="flex-1 bg-white dark:bg-slate-900 border border-violet-500 rounded px-2 py-0.5 text-sm focus:outline-none"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button type="submit" className="text-green-600 hover:text-green-700 p-1"><FaSave size={14} /></button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditTitle(task.title); }} className="text-red-500 hover:text-red-600 p-1"><FaTimes size={14} /></button>
                        </form>
                    ) : (
                        <span className="truncate" onDoubleClick={() => setIsEditing(true)} title="Double click to edit">{task.title}</span>
                    )}

                    {task.isTicket && !isEditing && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full flex items-center shrink-0">
                            <FaTicketAlt className="mr-1" size={10} /> Ticket
                        </span>
                    )}
                    {task.ticket?.column?.name?.toLowerCase()?.includes('closed') && !isEditing && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider">
                            Closed
                        </span>
                    )}
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-2 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="text-slate-400 hover:text-violet-600 p-1"
                        title="Edit"
                    >
                        <FaEdit size={14} />
                    </button>
                    {/* Add Buttons */}
                    {task.type === 'Heading' && (
                        <>
                            <button
                                onClick={() => onShowForm({ parentId: task._id, type: 'Sub-Heading' })}
                                className="text-xs px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium"
                            >
                                + Sub
                            </button>
                            <button
                                onClick={() => onShowForm({ parentId: task._id, type: 'Task' })}
                                className="text-xs px-2 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-md font-medium"
                            >
                                + Task
                            </button>
                        </>
                    )}
                    {task.type === 'Sub-Heading' && (
                        <button
                            onClick={() => onShowForm({ parentId: task._id, type: 'Task' })}
                            className="text-xs px-2 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded"
                        >
                            + Task
                        </button>
                    )}

                    {/* Add to Board */}
                    {!task.isTicket && (
                        (task.type === 'Task') ||
                        ((task.type === 'Heading' || task.type === 'Sub-Heading') && !hasChildren)
                    ) && (
                            <button
                                onClick={() => onConvert(task._id)}
                                className="text-xs px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded"
                            >
                                Board
                            </button>
                        )}
                </div>
            </div>

            {/* Inline Create Form */}
            {showCreateForm?.parentId === task._id && (
                <div className={`p-4 ${isHeading ? 'bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700' : 'ml-12 mt-2'}`}>
                    <form onSubmit={onAddSubmit} className={`p-3 bg-white dark:bg-slate-900 rounded-lg border border-violet-200 dark:border-violet-800 shadow-sm`}>
                        <input
                            autoFocus
                            type="text"
                            placeholder={`New ${showCreateForm.type} title...`}
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-500 mb-2 pb-1"
                            value={newTaskState.title}
                            onChange={e => setNewTaskState({ ...newTaskState, title: e.target.value })}
                        />
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={onCancelForm} className="text-xs px-2 py-1 text-slate-500">Cancel</button>
                            <button type="submit" className="text-xs px-3 py-1 bg-violet-600 text-white rounded">Add</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Children (Collapsible) */}
            {isOpen && hasChildren && (
                <div className={`${isHeading ? 'p-2 pt-0 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50' : 'mt-1'}`}>
                    {children.map(child => (
                        <TaskItem
                            key={child._id}
                            task={child}
                            allTasks={allTasks}
                            level={level + 1}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            onConvert={onConvert}
                            onAddSub={onAddSub}
                            onShowForm={onShowForm}
                            showCreateForm={showCreateForm}
                            onAddSubmit={onAddSubmit}
                            onCancelForm={onCancelForm}
                            newTaskState={newTaskState}
                            setNewTaskState={setNewTaskState}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const TaskListComponent = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(null); // { parentId, type } or null
    const { socket } = useSocket();
    const { success, error: toastError } = useToast();
    const { showConfirm } = useConfirm();

    // Form state
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', assignedTo: '' });

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    useEffect(() => {
        if (!socket) return;
        const handleTaskCreated = (newTask) => {
            if (newTask.project === projectId) {
                setTasks(prev => {
                    if (prev.some(t => t._id === newTask._id)) return prev;
                    return [...prev, newTask];
                });
            }
        };
        const handleTaskUpdated = (updatedTask) => {
            if (updatedTask.project === projectId) {
                setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
            }
        };
        const handleTaskDeleted = ({ taskId, projectId: deletedProjectId }) => {
            if (deletedProjectId === projectId) {
                setTasks(prev => prev.filter(t => t._id !== taskId));
            }
        };
        socket.on('task_created', handleTaskCreated);
        socket.on('task_updated', handleTaskUpdated);
        socket.on('task_deleted', handleTaskDeleted);
        return () => {
            socket.off('task_created', handleTaskCreated);
            socket.off('task_updated', handleTaskUpdated);
            socket.off('task_deleted', handleTaskDeleted);
        };
    }, [socket, projectId]);

    const fetchTasks = async () => {
        try {
            const res = await taskAPI.getProjectTasks(projectId);
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const payload = {
            title: newTask.title,
            description: newTask.description,
            project: projectId,
            parentTask: showCreateForm.parentId || null,
            type: showCreateForm.type
        };
        if (newTask.deadline) payload.deadline = newTask.deadline;
        if (newTask.assignedTo) payload.assignedTo = newTask.assignedTo;
        try {
            await taskAPI.createTask(payload);
            setShowCreateForm(null);
            setNewTask({ title: '', description: '', deadline: '', assignedTo: '' });
            fetchTasks();
            success('Task created successfully');
        } catch (error) {
            toastError("Failed to create task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        const isConfirmed = await showConfirm(
            "Are you sure you want to delete this task? Sub-tasks will also be deleted.",
            "Delete Task",
            "danger"
        );
        if (!isConfirmed) return;

        try {
            await taskAPI.deleteTask(taskId);
            fetchTasks(); // Optimistic update handled by socket usually, but manual refresh safe
            success('Task deleted successfully');
        } catch (error) {
            toastError("Failed to delete task");
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        try {
            await taskAPI.updateTask(taskId, updates);
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task", error);
            toastError("Failed to update task");
        }
    };

    const convertToTicket = async (taskId) => {
        try {
            await boardAPI.createTicket({ taskId, projectId });
            // Socket handles update?
            success("Ticket created on board!");
            fetchTasks();
        } catch (error) {
            toastError(error.response?.data?.message || "Failed to create ticket");
        }
    };

    if (loading) return <div>Loading tasks...</div>;

    // Filter root tasks (Headings)
    // Note: If a 'Task' is at root level (no parent), it should also be shown, though usually it's Headings.
    const rootTasks = tasks.filter(t => !t.parentTask);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Task Hierarchy</h2>
                <button
                    onClick={() => setShowCreateForm({ parentId: null, type: 'Heading' })}
                    className="btn-primary flex items-center text-sm px-3 py-1.5"
                >
                    <FaPlus className="mr-2" /> Add Main Heading
                </button>
            </div>

            {/* Root Level Form */}
            {showCreateForm?.parentId === null && (
                <div className="mb-4">
                    <form onSubmit={handleCreateTask} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-violet-200 dark:border-violet-800">
                        <input
                            autoFocus
                            type="text"
                            placeholder="New Heading Title..."
                            className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-violet-500 mb-2 font-bold"
                            value={newTask.title}
                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        />
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowCreateForm(null)} className="text-xs px-2 py-1 text-slate-500">Cancel</button>
                            <button type="submit" className="text-xs px-3 py-1 bg-violet-600 text-white rounded">Add</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-1">
                {rootTasks.map(task => (
                    <TaskItem
                        key={task._id}
                        task={task}
                        allTasks={tasks}
                        level={0}
                        onDelete={handleDeleteTask}
                        onUpdate={handleUpdateTask}
                        onConvert={convertToTicket}
                        onShowForm={setShowCreateForm}
                        showCreateForm={showCreateForm}
                        onAddSubmit={handleCreateTask}
                        onCancelForm={() => setShowCreateForm(null)}
                        newTaskState={newTask}
                        setNewTaskState={setNewTask}
                    />
                ))}

                {tasks.length === 0 && !showCreateForm && (
                    <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        No tasks yet. Create a Heading to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskListComponent;
