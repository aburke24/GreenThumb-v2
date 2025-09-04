import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/UserUser';
import { updateUserApi, deleteUserByEmailApi } from '../utils/userUtil';

const UserProfileModal = ({ isOpen, onClose }) => {
    const { user, logout, refreshGardens } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        city: '',
        state: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Pre-populate form data when the modal opens or user data changes
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                city: user.city || '',
                state: user.state || ''
            });
        }
    }, [user, isOpen]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle updating the user profile
    const handleSave = async () => {
        if (!user || !user.id) {
            setMessage('Error: User not logged in.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Send all form data to the update API
            await updateUserApi(user.id, formData);
            setMessage('Profile updated successfully!');
            await refreshGardens(); // Refresh user context data
            setTimeout(() => {
                onClose();
            }, 1500); // Close after a short delay to show the message
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage(error.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    // Handle deleting the user account
    const handleDelete = async () => {
        if (!user || !user.email) {
            setMessage('Error: User email not available.');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.');
        if (!confirmDelete) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            await deleteUserByEmailApi(user.email);
            setMessage('Account deleted successfully. Logging out...');
            setTimeout(() => {
                logout(); // Logs the user out and navigates to the login page
                navigate('/login');
            }, 2000); // Wait a bit before logging out and navigating
        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage(error.message || 'Failed to delete account.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-neutral-800 text-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4 sm:mx-0">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-400">City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-400">State</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                </div>

                {message && (
                    <p className={`mt-4 text-center text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                        {message}
                    </p>
                )}

                <div className="mt-6 flex justify-between space-x-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
