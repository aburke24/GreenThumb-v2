import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/UserUser';
import AddGardenModal from '../modal/AddGardenModal';
import UserProfileModal from '../modal/UserProfileModal';
import { deleteGardenApi } from '../utils/gardenUtil';

const HomePage = () => {
    const navigate = useNavigate();
    const { userData, loading: userLoading, logout, refreshUserData } = useUser();
    const user = userData?.user;
    const gardens = userData?.gardens;
    
    const [loading, setLoading] = useState(false);
    const [isGardenModalOpen, setIsGardenModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [hoveredGarden, setHoveredGarden] = useState(null);


    const handleLogout = async () => {
        setLoading(true);
        try {
            logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGardenModal = () => {
        setIsGardenModalOpen(true);
    };

    const handleCloseGardenModal = () => {
        setIsGardenModalOpen(false);
    };

    const handleOpenProfileModal = () => {
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
    };

    const handleGardenCreated = async () => {
        await refreshUserData();
        handleCloseGardenModal();
    };

    const handleMouseEnter = (garden) => {
        setHoveredGarden(garden);
    };

    const handleMouseLeave = () => {
        setHoveredGarden(null);
    };

    const handleGardenClick = (gardenId) => {
        console.log("The gardenId is ", gardenId);
        navigate(`/garden/${gardenId}`);
    };

    const handleDeleteGarden = async (e, gardenId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this garden? This action cannot be undone.')) {
            try {
                setLoading(true);
                await deleteGardenApi(user.id, gardenId);
                await refreshUserData();
            } catch (error) {
                console.error('Failed to delete garden:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (userLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-neutral-800 text-white">
                <span className="text-lg font-semibold">Loading your gardens...</span>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-neutral-800 font-sans text-white">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-700">
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold tracking-wide">Your Gardens</div>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleLogout}
                        disabled={loading}
                    >
                        {loading ? 'Logging Out...' : 'Log Out'}
                    </button>
                    <button onClick={handleOpenProfileModal} className="rounded-full bg-gray-600 p-2 hover:bg-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-col lg:flex-row flex-grow p-4 gap-6">
                {/* Gardens List */}
                <div className="flex-1 flex flex-col space-y-4">
                    <div className="bg-neutral-900 rounded-xl p-4 shadow-lg space-y-2">
                        {gardens && gardens.length > 0 ? (
                            [...gardens].reverse().map((garden) => (
                                <div
                                    key={garden.id}
                                    onClick={() => handleGardenClick(garden.id)}
                                    className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg shadow-md hover:bg-neutral-600 transition-colors cursor-pointer"
                                    onMouseEnter={() => handleMouseEnter(garden)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">{garden.garden_name}</span>
                                        {garden.is_active && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteGarden(e, garden.id)}
                                        className="text-red-400 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-4">You don't have any gardens yet.</p>
                        )}
                    </div>
                    {/* Add Another Garden Button */}
                    <button
                        onClick={handleOpenGardenModal}
                        className="mt-4 flex items-center justify-center space-x-2 py-3 px-6 bg-green-700 rounded-lg text-white font-medium hover:bg-green-600 transition-colors shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Another Garden</span>
                    </button>
                </div>

                {/* Summary Panel - Now only shows garden info on hover */}
                <div className="w-full lg:w-96 flex-shrink-0 bg-white text-neutral-800 p-6 rounded-2xl shadow-2xl">
                    <h2 className="text-xl font-bold mb-4">Garden Info</h2>
                    {hoveredGarden ? (
                        <ul className="space-y-2 text-gray-700">
                            <li><span className="font-semibold">ID:</span> {hoveredGarden.id}</li>
                            <li><span className="font-semibold">Name:</span> {hoveredGarden.garden_name}</li>
                            <li><span className="font-semibold">Width:</span> {hoveredGarden.width} ft</li>
                            <li><span className="font-semibold">Height:</span> {hoveredGarden.height} ft</li>
                        </ul>
                    ) : (
                        <p className="text-gray-500">Hover over a garden to see its details.</p>
                    )}
                </div>
            </main>

            {/* Render the modal component for adding a garden */}
            <AddGardenModal
                isOpen={isGardenModalOpen}
                onClose={handleCloseGardenModal}
                onGardenCreated={handleGardenCreated}
            />

            {/* Render the modal component for user profile */}
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={handleCloseProfileModal}
            />
        </div>
    );
};

export default HomePage;