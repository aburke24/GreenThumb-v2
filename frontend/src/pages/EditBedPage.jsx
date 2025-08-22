import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const EditBedPage = () => {
    const { bedId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen w-screen bg-neutral-800 text-white font-sans antialiased p-6 sm:p-10">
            {/* Header with Back Arrow */}
            <div className="flex items-center mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 rounded-full hover:bg-neutral-700"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-2xl font-bold flex-1 text-center">Edit Bed</h1>
                <div className="w-10"></div> {/* Spacer to center the title */}
            </div>

            {/* Content displaying the bedId */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-lg text-gray-400">
                    You are currently editing bed with ID:
                </p>
                <p className="text-4xl font-semibold mt-2">
                    {bedId}
                </p>
            </div>
        </div>
    );
};

export default EditBedPage;