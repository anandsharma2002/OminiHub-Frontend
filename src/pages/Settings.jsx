import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
import { FaMoon, FaSun, FaPalette, FaUser, FaBell, FaShieldAlt } from 'react-icons/fa';

import { authAPI } from '../api/auth';

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('appearance');

    return (
        <div className="page-container">
            <div className="mb-8 mt-5 md:mt-0">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your account preferences and application settings.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="card p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'appearance' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <FaPalette />
                            <span>Appearance</span>
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                        >
                            <FaUser />
                            <span>Profile</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'security' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <FaShieldAlt />
                            <span>Security</span>
                        </button>
                    </div>
                </div>

                {/* Main Settings Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Appearance Section */}
                    {activeTab === 'appearance' && (
                        <div className="card-glass p-6 animate-fade-in">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
                                    <FaPalette size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Customize the look and feel of the application.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                            <FaMoon />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">Dark Mode</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between light and dark themes.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeTab === 'security' && (
                        <SecuritySettings />
                    )}
                </div>
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    const [formData, setFormData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [loading, setLoading] = React.useState(false);

    // Import authAPI here or use context if available


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.newPassword !== formData.confirmNewPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-glass p-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
                    <FaShieldAlt size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and security settings.</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 mb-4 rounded-xl text-sm border ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        className="input-field w-full bg-slate-50 dark:bg-slate-800/50"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            minLength="6"
                            className="input-field w-full bg-slate-50 dark:bg-slate-800/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            required
                            minLength="6"
                            className="input-field w-full bg-slate-50 dark:bg-slate-800/50"
                        />
                    </div>
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="btn-primary py-2 px-6">
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
