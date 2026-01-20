import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import UserProfile from './pages/UserProfile';
import GitHubPage from './pages/GitHubPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';

import Features from './pages/Features';
import Pricing from './pages/Pricing';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetails from './pages/ProjectDetails';

import DashboardLayout from './components/layout/DashboardLayout';
import { ThemeProvider } from './context/ThemeContext';

import GlobalSocketListener from './components/GlobalSocketListener';

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <NotificationProvider>
                    <GlobalSocketListener />
                    <ThemeProvider>
                        <HashRouter>
                            <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100">
                                <Navbar />
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/features" element={<Features />} />
                                    <Route path="/pricing" element={<Pricing />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />

                                    {/* Protected Routes */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route element={<DashboardLayout />}>
                                            <Route path="/dashboard" element={<Dashboard />} />
                                            <Route path="/projects" element={<ProjectsPage />} />
                                            <Route path="/projects/:id" element={<ProjectDetails />} />
                                            <Route path="/docs" element={<Documents />} />
                                            <Route path="/settings" element={<Settings />} />
                                            <Route path="/profile" element={<Profile />} />
                                            <Route path="/github" element={<GitHubPage />} />
                                            <Route path="/notifications" element={<NotificationsPage />} />
                                            <Route path="/chat" element={<ChatPage />} />
                                            <Route path="/user/:id" element={<UserProfile />} />
                                        </Route>
                                    </Route>

                                    {/* 404 Route */}
                                    <Route path="*" element={<Home />} />
                                </Routes>
                            </div>
                        </HashRouter>
                    </ThemeProvider>
                </NotificationProvider>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
