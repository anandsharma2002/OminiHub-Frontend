import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { FaRocket, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Code+Password
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { error: toastError } = useToast();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setStep(2);
            setMessage('Verification code sent to your email.');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to send code';
            toastError(`Error: ${errorMsg}`); // User facing toast
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await authAPI.resetPassword({ email, code, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-var(--nav-height))] flex bg-slate-50 dark:bg-[#020617] items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2 text-violet-600 mb-6">
                        <FaRocket size={24} /> <span className="text-xl font-bold">OmniHub</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        {step === 1
                            ? "Enter your email to receive a reset code."
                            : "Enter the code and your new password."}
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800 animate-fade-in">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-100 dark:border-green-800 animate-fade-in">
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
                        <div className="space-y-4">
                            <FormInput
                                icon={<FaEnvelope />}
                                name="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 shadow-violet-500/20">
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                        <div className="space-y-4">
                            <FormInput
                                icon={<FaKey />}
                                name="code"
                                type="text"
                                placeholder="6-Digit Code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                            <FormInput
                                icon={<FaLock />}
                                name="password"
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 shadow-violet-500/20">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="text-violet-600 hover:text-violet-500 font-semibold text-sm">
                        Back to Login
                    </Link>
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
            className="input-field pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white w-full"
        />
    </div>
);

export default ForgotPassword;
