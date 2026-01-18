import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import userAPI from '../api/user';
import { FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt, FaEdit, FaCamera, FaSave, FaTimes, FaPlus, FaTrash, FaGithub, FaLinkedin, FaCode } from 'react-icons/fa';
import UserListModal from '../components/social/UserListModal';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        socialLinks: []
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('followers'); // followers | following

    // Initialize state when user loads or edit mode opens
    useEffect(() => {
        if (user) {
            let links = user.profile?.socialLinks || [];
            // Handle legacy string links if any
            if (links.length > 0 && typeof links[0] === 'string') {
                links = links.map(link => ({ platform: 'Website', url: link }));
            }

            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.profile?.bio || '',
                socialLinks: links
            });
            setPreviewImage(user.profile?.image === 'default.jpg' ? null : user.profile?.image);
        }
    }, [user, isEditing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Social Links Handlers
    const handleLinkChange = (index, field, value) => {
        const newLinks = [...formData.socialLinks];
        newLinks[index][field] = value;
        setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    };

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
        }));
    };

    const removeSocialLink = (index) => {
        const newLinks = formData.socialLinks.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('bio', formData.bio);
            data.append('socialLinks', JSON.stringify(formData.socialLinks));

            if (imageFile) {
                data.append('profileImage', imageFile);
            }

            const res = await userAPI.updateProfile(data);

            if (res.status === 'success') {
                updateUser(res.data.user);
                setIsEditing(false);
                // Optional: Show toast success
            }
        } catch (error) {
            console.error('Update failed:', error);
            // Optional: Show toast error
        } finally {
            setLoading(false);
        }
    };

    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'January 2024';

    // Helper to get icon for platform (optional enhancement)
    const getPlatformIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('github')) return <FaGithub />;
        if (p.includes('linkedin')) return <FaLinkedin />;
        if (p.includes('leetcode') || p.includes('codeforces')) return <FaCode />;
        return <FaEdit />; // Default
    };

    return (
        <div className="page-container">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        View and manage your personal information.
                    </p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FaEdit />
                        <span>Edit Profile</span>
                    </button>
                ) : (
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="btn-secondary flex items-center justify-center px-4 py-2"
                            disabled={loading}
                        >
                            <FaTimes className="mr-2" /> Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary flex items-center justify-center px-4 py-2"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : <><FaSave className="mr-2" /> Save</>}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card / Edit Form */}
                <div className="lg:col-span-1">
                    <div className="card-glass p-8 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 dark:opacity-40"></div>

                        {/* Avatar */}
                        <div className="relative z-10 mb-4 group">
                            <div className="w-32 h-32 rounded-full bg-violet-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-5xl font-bold text-violet-600 dark:text-violet-400 overflow-hidden">
                                {previewImage || (user?.profile?.image && user.profile.image !== 'default.jpg') ? (
                                    <img
                                        src={previewImage || user.profile.image}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user?.username?.[0]?.toUpperCase()
                                )}
                            </div>

                            {isEditing && (
                                <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                    <FaCamera className="text-white text-2xl" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Name & Role */}
                        {!isEditing ? (
                            <>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-2">@{user?.username}</p>
                                <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-sm font-medium mb-6">
                                    {user?.role || 'User'}
                                </span>

                                <div className="flex justify-center w-full gap-8 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div
                                        className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => { setModalType('followers'); setModalOpen(true); }}
                                    >
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{user?.followers?.length || 0}</p>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Followers</p>
                                    </div>
                                    <div
                                        className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => { setModalType('following'); setModalOpen(true); }}
                                    >
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{user?.following?.length || 0}</p>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Following</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full space-y-3 mb-6">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First Name"
                                        className="input-field"
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last Name"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        <div className="w-full space-y-4 text-left">
                            {/* Bio */}
                            {!isEditing ? (
                                user?.profile?.bio && (
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <p className="text-xs text-slate-500 mb-1">Bio</p>
                                        <p className="text-sm text-slate-900 dark:text-slate-200">
                                            {user.profile.bio}
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Tell us about yourself..."
                                        className="input-field min-h-[80px]"
                                    />
                                </div>
                            )}

                            {/* Static Info */}
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <FaEnvelope className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">Email Address</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <FaCalendarAlt className="text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500">Joined</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                            {joinDate}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}

                    </div>
                </div>

                {/* Right Column: Social Links & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Social Links Section */}
                    <div className="card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Social Profiles</h3>
                            {isEditing && (
                                <button
                                    onClick={addSocialLink}
                                    className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center"
                                >
                                    <FaPlus className="mr-1" /> Add Link
                                </button>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user?.profile?.socialLinks?.length > 0 ? (
                                    user.profile.socialLinks.map((link, index) => {
                                        // Handle both old string format and new object format
                                        const platform = typeof link === 'object' ? link.platform : 'Website';
                                        const url = typeof link === 'object' ? link.url : link;

                                        return (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-violet-600 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors">
                                                    {getPlatformIcon(platform)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{platform}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{url}</p>
                                                </div>
                                            </a>
                                        );
                                    })
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm col-span-2 italic">
                                        No social links added yet.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.socialLinks.map((link, index) => (
                                    <div key={index} className="flex space-x-2 items-start">
                                        <div className="grid grid-cols-3 gap-2 flex-1">
                                            <input
                                                type="text"
                                                placeholder="Platform (e.g. GitHub)"
                                                value={link.platform}
                                                onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                                                className="input-field col-span-1"
                                            />
                                            <input
                                                type="url"
                                                placeholder="URL (https://...)"
                                                value={link.url}
                                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                                className="input-field col-span-2"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeSocialLink(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                                {formData.socialLinks.length === 0 && (
                                    <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        Add links to your professional profiles.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Check if user needs Stats Section logic preserved - yes, keeping it static or existing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="card p-6 border-l-4 border-violet-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Projects</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{user?.projects?.length || 0}</p>
                        </div>
                        <div className="card p-6 border-l-4 border-indigo-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Streaks</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{user?.streaks?.current || 0} 🔥</p>
                        </div>
                    </div>



                </div>
            </div>
            {/* User List Modal */}
            <UserListModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)}
                userId={user?._id}
                type={modalType}
            />
        </div>
    );
};

export default Profile;
