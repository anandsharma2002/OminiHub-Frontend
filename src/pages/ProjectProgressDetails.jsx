import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectAPI from '../api/project';
import boardAPI from '../api/board';
import taskAPI from '../api/task';
import { useSocket } from '../context/SocketContext';
import CircularProgressBar from '../components/CircularProgressBar';
import { FaArrowLeft, FaTasks, FaCheckCircle, FaSpinner, FaLayerGroup } from 'react-icons/fa';

const ProjectProgressDetails = () => {
    const { id } = useParams();
    const { socket } = useSocket();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [columns, setColumns] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [tasks, setTasks] = useState([]);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, boardRes, taskRes] = await Promise.all([
                    projectAPI.getProject(id),
                    boardAPI.getBoard(id),
                    taskAPI.getProjectTasks(id)
                ]);

                setProject(projectRes.data);
                setColumns(boardRes.data.columns || []);
                setTickets(boardRes.data.tickets || []);
                setTasks(taskRes.data || []);
            } catch (error) {
                console.error("Failed to load progress data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- Real-time Socket Listeners ---
    useEffect(() => {
        if (!socket || !id) return;

        const roomName = `project_${id}`;
        socket.emit('join_entity', roomName);

        // Project
        socket.on('project_updated', (updatedProject) => {
            if (updatedProject.projectId === id) {
                // For deep updates we normally assume partials, but let's stick to simple refresh if needed 
                // or manual update if we had full object. 
                // Here we mostly care about tasks/tickets.
            }
        });

        // Board: Columns
        socket.on('column_created', (col) => {
            if (col.project === id) setColumns(prev => [...prev, col].sort((a, b) => a.order - b.order));
        });
        socket.on('column_deleted', ({ columnId, projectId }) => {
            if (projectId === id) setColumns(prev => prev.filter(c => c._id !== columnId));
        });
        socket.on('columns_reordered', ({ projectId, columns: newCols }) => {
            if (projectId === id) setColumns(newCols); // newCols usually sorted
        });

        // Board: Tickets
        socket.on('ticket_created', (ticket) => {
            if (ticket.project === id) setTickets(prev => [...prev, ticket]);
        });
        socket.on('ticket_updated', (updatedTicket) => {
            // Check based on ticket ID
            if (updatedTicket.project === id) {
                setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
            }
        });
        socket.on('ticket_deleted', ({ ticketId, projectId }) => {
            if (projectId === id) setTickets(prev => prev.filter(t => t._id !== ticketId));
        });

        // Tasks
        socket.on('task_created', (task) => {
            if (task.project === id) setTasks(prev => [...prev, task]);
        });
        socket.on('task_updated', (updatedTask) => {
            // If a task updates, we just update it in the list
            if (updatedTask.project === id) {
                setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
            }
        });
        socket.on('task_deleted', (taskId) => {
            // The event might be just ID or obj. Assuming ID based on typical patterns. 
            // Ideally we check payload. Let's assume standard { taskId, projectId } or just ID
            // If payload is object
            const tId = typeof taskId === 'object' ? taskId.taskId : taskId;
            setTasks(prev => prev.filter(t => t._id !== tId));
        });

        return () => {
            socket.emit('leave_entity', roomName);
            socket.off('project_updated');
            socket.off('column_created');
            socket.off('column_deleted');
            socket.off('columns_reordered');
            socket.off('ticket_created');
            socket.off('ticket_updated');
            socket.off('ticket_deleted');
            socket.off('task_created');
            socket.off('task_updated');
            socket.off('task_deleted');
        };
    }, [socket, id]);


    // --- Calculation Logic (Memoized) ---
    const stats = useMemo(() => {
        if (!columns.length) return { progress: 0, notStarted: [], inProgress: [], closed: [], totalCount: 0 };

        // 1. Calculate Column Weights
        const step = columns.length > 1 ? 100 / (columns.length - 1) : 0;
        const colWeights = {};
        columns.forEach((col, idx) => {
            colWeights[col._id] = idx * step;
        });

        const sortedCols = [...columns].sort((a, b) => a.order - b.order);
        const firstColId = sortedCols[0]?._id;
        const lastColId = sortedCols[sortedCols.length - 1]?._id;


        // 2. Maps
        const ticketMap = new Map();
        tickets.forEach(t => ticketMap.set(t.task?._id || t.task, t)); // ticket.task might be populated or ID

        const parentMap = new Set();
        tasks.forEach(t => {
            if (t.parentTask) parentMap.add(t.parentTask.toString());
        });

        const notStarted = [];
        const inProgress = [];
        const closed = [];

        let totalProgressSum = 0;
        let count = 0;

        // 3. Iterate Tasks
        tasks.forEach(task => {
            // Determine if countable
            let isCountable = false;
            if (task.isTicket) isCountable = true;
            else if (task.type === 'Task') isCountable = true;
            else if ((task.type === 'Heading' || task.type === 'Sub-Heading') && !parentMap.has(task._id)) isCountable = true;

            if (!isCountable) return;

            count++;

            // Calculate Progress & Category
            let p = 0;
            let category = 'not_started'; // default

            const ticket = ticketMap.get(task._id);

            if (ticket) {
                // It is a Ticket
                const colId = ticket.column?._id || ticket.column; // populated or not
                p = colWeights[colId] !== undefined ? colWeights[colId] : 0;

                // Categorize based on column
                if (colId === firstColId) category = 'not_started';
                else if (colId === lastColId) category = 'closed';
                else category = 'in_progress';

            } else {
                // Standalone Task/Heading
                if (task.status === 'Done') {
                    p = 100;
                    category = 'closed';
                } else if (task.status === 'In Progress') {
                    p = 50;
                    category = 'in_progress';
                } else {
                    p = 0;
                    category = 'not_started';
                }
            }

            totalProgressSum += p;

            const item = { ...task, progress: p };
            if (category === 'not_started') notStarted.push(item);
            else if (category === 'in_progress') inProgress.push(item);
            else closed.push(item);
        });

        return {
            progress: count > 0 ? Math.round(totalProgressSum / count) : 0,
            notStarted,
            inProgress,
            closed,
            totalCount: count
        };

    }, [columns, tickets, tasks]);


    if (loading) return (
        <div className="page-container flex justify-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
    );

    if (!project) return <div className="page-container text-center pt-20">Project not found</div>;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <Link to="/progress" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                            {project.name} Progress
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time breakdown</p>
                    </div>
                </div>

                <Link
                    to={`/projects/${id}`}
                    className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-violet-500/30"
                >
                    <FaTasks />
                    <span>Tasks</span>
                </Link>
            </div>

            {/* Top Section: Chart & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Chart Card */}
                <div className="card-glass p-8 flex flex-col items-center justify-center lg:col-span-1">
                    <CircularProgressBar
                        progress={stats.progress}
                        size={200}
                        strokeWidth={15}
                        progressColor={stats.progress === 100 ? "text-emerald-500" : "text-violet-600"}
                    />
                    <div className="mt-4 text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Total Progress</h3>
                        <p className="text-slate-500 dark:text-slate-400">{stats.totalCount} Tracked Items</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                        title="Not Started"
                        count={stats.notStarted.length}
                        icon={<FaLayerGroup />}
                        color="text-slate-500"
                        bg="bg-slate-50 dark:bg-slate-800/50"
                    />
                    <StatsCard
                        title="In Progress"
                        count={stats.inProgress.length}
                        icon={<FaSpinner className="animate-spin-slow" />}
                        color="text-violet-600"
                        bg="bg-violet-50 dark:bg-violet-900/20"
                    />
                    <StatsCard
                        title="Completed"
                        count={stats.closed.length}
                        icon={<FaCheckCircle />}
                        color="text-emerald-500"
                        bg="bg-emerald-50 dark:bg-emerald-900/10"
                    />
                </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TaskTable title="Not Started" tasks={stats.notStarted} headerColor="border-slate-300 dark:border-slate-700" />
                <TaskTable title="In Progress" tasks={stats.inProgress} headerColor="border-violet-500" />
                <TaskTable title="Closed" tasks={stats.closed} headerColor="border-emerald-500" />
            </div>

        </div>
    );
};

// Sub-components
const StatsCard = ({ title, count, icon, color, bg }) => (
    <div className={`p-6 rounded-2xl border border-slate-100 dark:border-slate-800 ${bg} flex flex-col items-center justify-center h-full`}>
        <div className={`text-3xl mb-2 ${color}`}>{icon}</div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{count}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{title}</div>
    </div>
);

const TaskTable = ({ title, tasks, headerColor }) => (
    <div className="card-glass overflow-hidden flex flex-col h-[500px]">
        <div className={`p-4 border-b-4 ${headerColor} bg-white dark:bg-slate-900/50`}>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex justify-between items-center">
                {title}
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500">{tasks.length}</span>
            </h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2 themed-scrollbar">
            {tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <p className="text-sm">No items</p>
                </div>
            ) : (
                tasks.map(task => (
                    <div key={task._id} className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-2">{task.title}</h4>
                            {task.type !== 'Task' && (
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border border-slate-200 dark:border-slate-700 px-1 rounded">
                                    {task.type === 'Sub-Heading' ? 'SUB' : 'HEAD'}
                                </span>
                            )}
                        </div>
                        <div className="mt-2 flex justify-between items-center text-xs">
                            <span className="text-slate-500">{task.isTicket ? 'Ticket' : 'Task'}</span>
                            <span className={`font-bold ${task.progress === 100 ? 'text-emerald-500' : 'text-violet-500'}`}>{Math.round(task.progress)}%</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

export default ProjectProgressDetails;
