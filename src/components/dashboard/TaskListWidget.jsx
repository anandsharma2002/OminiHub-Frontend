import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TaskListWidget = ({ tasks }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            case 'High': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
            case 'Medium': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
            default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
        }
    };

    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center py-8">
                <FaCheckCircle className="mx-auto text-4xl text-emerald-200 dark:text-emerald-800 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">All caught up! No pending tasks.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <div key={task._id} className="flex items-start p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="mt-1 mr-3 text-slate-400">
                        <FaExclamationCircle className={task.priority === 'Critical' ? 'text-red-500' : 'text-slate-300'} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {task.project ? (
                            <Link to={`/projects/${task.project._id}`} className="block">
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate hover:text-violet-600 dark:hover:text-violet-400">
                                    {task.title}
                                </h4>
                            </Link>
                        ) : (
                            <div className="block">
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {task.title}
                                </h4>
                            </div>
                        )}
                        <div className="flex items-center mt-1 space-x-3 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                            <span className="flex items-center text-slate-500">
                                <FaClock className="mr-1" size={10} />
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </span>
                            {task.project && (
                                <span className="text-slate-400 truncate max-w-[100px]">
                                    {task.project.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskListWidget;
