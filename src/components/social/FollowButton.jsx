import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa';
import { sendFollowRequest, getFollowStatus, unfollowUser } from '../../api/social';
import useAuth from '../../hooks/useAuth';

const FollowButton = ({ targetUserId, onStatusChange, onSuccess }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, none, pending, following
    const [loading, setLoading] = useState(false);

    // Initial Status Check
    useEffect(() => {
        const checkStatus = async () => {
            if (!user || !targetUserId || user._id === targetUserId) {
                setStatus('hidden');
                return;
            }

            try {
                const res = await getFollowStatus(targetUserId);
                if (res.data.status === 'success') {
                    const { isFollowing, hasPendingRequest } = res.data.data;
                    if (isFollowing) setStatus('following');
                    else if (hasPendingRequest) setStatus('pending');
                    else setStatus('none');
                }
            } catch (err) {
                console.error("Failed to check follow status:", err);
                setStatus('error');
            }
        };

        checkStatus();
    }, [user, targetUserId]);

    const handleUnfollow = async () => {
        if (loading) return;
        if (!window.confirm("Are you sure you want to unfollow this user?")) return;

        setLoading(true);
        try {
            const res = await unfollowUser(targetUserId);
            if (res.data.status === 'success') {
                setStatus('none');
                if (onStatusChange) onStatusChange('none');
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error("Failed to unfollow:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await sendFollowRequest(targetUserId);
            if (res.data.status === 'success') {
                setStatus('pending');
                if (onStatusChange) onStatusChange('pending');
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error("Failed to send follow request:", err);
            // Optionally show toast error
        } finally {
            setLoading(false);
        }
    };

    if (status === 'hidden' || status === 'loading') return null;

    if (status === 'following') {
        return (
            <button
                onClick={handleUnfollow}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all group"
                disabled={loading}
            >
                {loading ? (
                    <span>Processing...</span>
                ) : (
                    <>
                        <FaUserCheck className="group-hover:hidden" />
                        <FaUserTimes className="hidden group-hover:block" />
                        <span className="group-hover:hidden">Following</span>
                        <span className="hidden group-hover:block">Unfollow</span>
                    </>
                )}
            </button>
        );
    }

    if (status === 'pending') {
        return (
            <button
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium text-sm cursor-default"
                disabled
            >
                <FaUserClock />
                <span>Requested</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`
                flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-500/30
                ${loading ? 'opacity-75 cursor-not-allowed' : ''}
            `}
        >
            <FaUserPlus />
            <span>{loading ? 'Sending...' : 'Follow'}</span>
        </button>
    );
};

export default FollowButton;
