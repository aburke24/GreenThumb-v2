import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GardenPage = () => {
    // useParams is a React Router hook that gives us access to URL parameters
    const { gardenId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-800 text-white font-sans">
            <h1 className="text-4xl font-bold mb-4">Garden Details</h1>
            <p className="text-xl">Viewing garden with ID: <span className="text-green-400">{gardenId}</span></p>
            <button
                onClick={() => navigate('/home')}
                className="mt-8 py-2 px-6 bg-neutral-700 rounded-lg text-white font-medium hover:bg-neutral-600 transition-colors shadow-lg"
            >
                Back to Home
            </button>
        </div>
    );
};

export default GardenPage;
