import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

import DashboardLayout from './components/layout/DashboardLayout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <HashRouter>
                    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100">
                        <Navbar />
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<DashboardLayout />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/docs" element={<Documents />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/user/:id" element={<UserProfile />} />
                                </Route>
                            </Route>

                            {/* 404 Route */}
                            <Route path="*" element={<Home />} />
                        </Routes>
                    </div>
                </HashRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
