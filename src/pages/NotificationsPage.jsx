import React from 'react';
import NotificationList from '../components/social/NotificationList';
import { FaBell } from 'react-icons/fa';

const NotificationsPage = () => {
    return (
        <div className="page-container">
            <div className="flex items-center space-x-3 mb-8">
                <FaBell className="text-2xl text-violet-600 dark:text-violet-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Notifications
                </h1>
            </div>

            <div className="card-glass overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-slate-800 dark:text-white">Recent Activity</h2>
                </div>
                <NotificationList />
            </div>
        </div>
    );
};

export default NotificationsPage;
