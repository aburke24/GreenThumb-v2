import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/UserUser'; 

const HomePage = () => {
    const navigate = useNavigate();
     const { user } = useUser(); 
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
    // Set loading state to true to indicate the process has started
    setLoading(true);

    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiration');
      navigate('/');
      console.log("Logged out successfully.");
    } catch (error) {
          console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
   <div className="flex flex-col min-h-screen bg-neutral-800 font-sans text-white">
  {/* Header */}
  <header className="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-700">
    {/* Left-aligned back button and header */}
    <div className="flex items-center space-x-4">
      <div className="text-xl font-bold tracking-wide">Your Gardens</div>
    </div>
    {/* Right-aligned user info and logout */}
    <div className="flex items-center space-x-4">
      {/* Logout button (hidden on smaller screens) */}
        <button 
        className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? 'Logging Out...' : 'Log Out'}
      </button>
      {/* User profile button */}
      <button className="rounded-full bg-gray-600 p-2 hover:bg-gray-500 transition-colors">
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
      <div className="bg-neutral-900 rounded-xl p-4 shadow-lg">
        {/* Garden List Items (place dynamic list here) */}
        <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg shadow-md hover:bg-neutral-600 transition-colors cursor-pointer">
          <div className="flex items-center space-x-2">
            <span className="text-lg">Spring Garden</span>
            <span className="text-yellow-400 text-2xl">★</span>
          </div>
          <button className="text-red-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* This is a placeholder for a second list item */}
        <div className="mt-4 flex items-center justify-between p-4 bg-neutral-700 rounded-lg shadow-md hover:bg-neutral-600 transition-colors cursor-pointer">
          <span className="text-lg">Fall Garden</span>
          <button className="text-red-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Add Another Garden Button */}
      <button className="mt-4 flex items-center justify-center space-x-2 py-3 px-6 bg-green-700 rounded-lg text-white font-medium hover:bg-green-600 transition-colors shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Add Another Garden</span>
      </button>
    </div>

    {/* Summary Panel */}
     <div className="w-full lg:w-96 flex-shrink-0 bg-white text-neutral-800 p-6 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold mb-4">User Info</h2>
          {user ? (
            <ul className="space-y-2 text-gray-700">
              <li><span className="font-semibold">ID:</span> {user.id}</li>
              <li><span className="font-semibold">Username:</span> {user.username}</li>
              <li><span className="font-semibold">Email:</span> {user.email}</li>
              <li><span className="font-semibold">City:</span> {user.city || 'N/A'}</li>
              <li><span className="font-semibold">State:</span> {user.state || 'N/A'}</li>
            </ul>
          ) : (
            <p className="text-gray-500">No user data available.</p>
          )}
        </div>
  </main>
</div>
  );
};

export default HomePage;
