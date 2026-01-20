import React, { useState, useEffect } from 'react';
import taskAPI from '../../api/task';
import boardAPI from '../../api/board';
import { FaPlus, FaCheckCircle, FaCircle, FaChevronRight, FaChevronDown, FaEllipsisH, FaTicketAlt, FaTrash } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';

const TaskListComponent = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(null); // { parentId, type } or null
    const { socket } = useSocket();

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
        } catch (error) {
            alert("Failed to create task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task? Sub-tasks will also be deleted.")) return;
        try {
            await taskAPI.deleteTask(taskId);
            fetchTasks();
        } catch (error) {
            alert("Failed to delete task");
        }
    };

    const convertToTicket = async (taskId) => {
        try {
            await boardAPI.createTicket({ taskId, projectId });
            fetchTasks(); // Refresh to update isTicket status
            alert("Ticket created on board!");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create ticket");
        }
    };

    // Recursive render helper
    const renderHierarchy = (parentId = null, level = 0) => {
        const currentTasks = tasks.filter(t => (t.parentTask === parentId) || (parentId === null && !t.parentTask));

        // Sorting logic if needed (e.g., creation date)

        return currentTasks.map(task => (
            <div key={task._id} className={`pl-${level * 4} mb-2`}>
                <div className={`
                    group flex items-center justify-between p-3 rounded-lg border transition-all
                    ${task.type === 'Heading' ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-lg' : ''}
                    ${task.type === 'Sub-Heading' ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 font-semibold ml-4' : ''}
                    ${task.type === 'Task' ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-violet-200 ml-8' : ''}
                `}>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                        >
                            <FaTrash size={14} />
                        </button>

                        {task.type === 'Task' && (
                            <div className="text-slate-400 hover:text-green-500 cursor-pointer">
                                {task.status === 'Done' ? <FaCheckCircle className="text-green-500" /> : <FaCircle size={14} />}
                            </div>
                        )}
                        <span className="text-slate-900 dark:text-white capitalize">{task.title}</span>
                        {task.isTicket && (
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full flex items-center">
                                <FaTicketAlt className="mr-1" size={10} /> Ticket
                            </span>
                        )}
                    </div>

                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                        {/* Only Headings can have Sub-Headings or Tasks */}
                        {task.type === 'Heading' && (
                            <>
                                <button
                                    onClick={() => setShowCreateForm({ parentId: task._id, type: 'Sub-Heading' })}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                    + Sub-Heading
                                </button>
                                <button
                                    onClick={() => setShowCreateForm({ parentId: task._id, type: 'Task' })}
                                    className="text-xs px-2 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded"
                                >
                                    + Task
                                </button>
                            </>
                        )}
                        {/* Sub-Headings can have Tasks */}
                        {task.type === 'Sub-Heading' && (
                            <button
                                onClick={() => setShowCreateForm({ parentId: task._id, type: 'Task' })}
                                className="text-xs px-2 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded"
                            >
                                + Task
                            </button>
                        )}
                        {/* Tasks can be converted to tickets */}
                        {/* Condition: Type is Task OR (Type is Heading/Sub-Heading AND it has no children) */}
                        {!task.isTicket && (
                            (task.type === 'Task') ||
                            ((task.type === 'Heading' || task.type === 'Sub-Heading') && !tasks.some(t => t.parentTask === task._id))
                        ) && (
                                <button
                                    onClick={() => convertToTicket(task._id)}
                                    className="text-xs px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded"
                                >
                                    Add to Board
                                </button>
                            )}
                    </div>
                </div>

                {/* Inline Create Form */}
                {showCreateForm?.parentId === task._id && (
                    <div className={`pl-${(level + 1) * 4} mt-2`}>
                        <form onSubmit={handleCreateTask} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-violet-200 dark:border-violet-800">
                            <input
                                autoFocus
                                type="text"
                                placeholder={`New ${showCreateForm.type} title...`}
                                className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-violet-500 mb-2"
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

                {/* Recursion */}
                {renderHierarchy(task._id, level + 1)}
            </div>
        ));
    };

    if (loading) return <div>Loading tasks...</div>;

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
                {renderHierarchy(null, 0)}
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
