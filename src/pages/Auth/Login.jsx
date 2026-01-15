import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaRocket, FaGoogle, FaGithub, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Send as 'identifier' to match backend expectation (or backend handles 'email' alias)
            // Our backend now handles { identifier, password } or { email, password } or { username, password }
            // We'll pass it as 'identifier' for clarity
            await login({ identifier, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-var(--nav-height))] flex bg-slate-50 dark:bg-[#020617]">
            {/* Left Side - Visual (Unchanged) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 to-indigo-900 relative overflow-hidden items-center justify-center p-12">
                {/* ... (Visual content omitted for brevity, keeping existing structure via tool) ... */}
                {/* Note: In replace_file_content, I must provide exact match for what I replace. 
                   I will target the specific code blocks instead of re-writing the whole visual part if possible, 
                   but here I am replacing the top part of component to init state. */ }
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="lg:hidden inline-flex items-center space-x-2 text-violet-600 mb-8">
                            <FaRocket /> <span>OmniHub</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Sign in to your account</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Don't have an account?
                            <Link to="/signup" className="text-violet-600 hover:text-violet-500 font-semibold ml-1">
                                Join now
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800 animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative">
                                <FormInput
                                    icon={<FaEnvelope />}
                                    type="text"
                                    placeholder="Email or Username"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <FormInput
                                    icon={<FaLock />}
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" type="checkbox" className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-violet-600 hover:text-violet-500">Forgot password?</Link>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-3 shadow-violet-500/20">
                            Sign In
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-50 dark:bg-[#020617] text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SocialButton icon={<FaGoogle />} label="Google" />
                            <SocialButton icon={<FaGithub />} label="GitHub" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
        </div>
        <input
            {...props}
            className="input-field pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
        />
    </div>
);

const SocialButton = ({ icon, label }) => (
    <button type="button" className="flex items-center justify-center space-x-2 w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-slate-700 dark:text-slate-300 font-medium">
        {icon}
        <span>{label}</span>
    </button>
);

export default Login;
