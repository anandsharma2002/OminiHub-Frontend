import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaRocket, FaUser, FaEnvelope, FaLock, FaGoogle, FaGithub } from 'react-icons/fa';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signup(formData.username, formData.email, formData.password, formData.firstName, formData.lastName);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-var(--nav-height))] flex bg-slate-50 dark:bg-[#020617]">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-indigo-900 to-violet-600 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                {/* Decorative Blobs */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px]"></div>
                <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-violet-400/20 rounded-full blur-[80px]"></div>


                <div className="relative z-10 text-white max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Start your journey with <span className="text-violet-200">OmniHub</span></h1>
                    <ul className="space-y-6 text-lg text-indigo-100">
                        <li className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><FaRocket /></div>
                            <span>Launch projects in minutes, not days.</span>
                        </li>
                        <li className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><FaUser /></div>
                            <span>Collaborate real-time with your squad.</span>
                        </li>
                        <li className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><FaLock /></div>
                            <span>Enterprise-grade security included.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="lg:hidden inline-flex items-center space-x-2 text-violet-600 mb-8">
                            <FaRocket /> <span>OmniHub</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create your account</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Already have an account?
                            <Link to="/login" className="text-violet-600 hover:text-violet-500 font-semibold ml-1">
                                Log in
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
                            <FormInput
                                icon={<FaUser />}
                                name="username"
                                type="text"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    icon={<FaUser />}
                                    name="firstName"
                                    type="text"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <FormInput
                                    icon={<FaUser />}
                                    name="lastName"
                                    type="text"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <FormInput
                                icon={<FaEnvelope />}
                                name="email"
                                type="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <FormInput
                                icon={<FaLock />}
                                name="password"
                                type="password"
                                placeholder="Password (min 6 chars)"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                required
                            />
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="terms" type="checkbox" required className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="font-medium text-slate-700 dark:text-slate-300">
                                    I agree to the <a href="#" className="text-violet-600 hover:text-violet-500">Terms of Service</a> and <a href="#" className="text-violet-600 hover:text-violet-500">Privacy Policy</a>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-3 shadow-violet-500/20">
                            Create Account
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-50 dark:bg-[#020617] text-slate-500">Or sign up with</span>
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

export default Signup;
