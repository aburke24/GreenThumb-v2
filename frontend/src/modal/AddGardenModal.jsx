import React, { useState } from 'react';
import { createGardenApi } from '../utils/gardenUtil';
import { useUser } from '../hooks/UserUser';

const AddGardenModal = ({ isOpen, onClose, onGardenCreated }) => {
    const { userData } = useUser();
    const [newGardenData, setNewGardenData] = useState({ garden_name: '', width: '', height: '' });
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGardenData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleCreateGarden = async (e) => {
        e.preventDefault();
        setFormError('');

        // Basic validation for empty fields
        if (!newGardenData.garden_name || !newGardenData.width || !newGardenData.height) {
            setFormError('Please fill in all fields.');
            return;
        }

        // Parse numerical values from the input
        const width = Number(newGardenData.width);
        const height = Number(newGardenData.height);
        
        // Validation for max and negative values
        if (width <= 0 || height <= 0) {
            setFormError('Width and height must be positive numbers.');
            return;
        }
        
        if (width > 50 || height > 50) {
            setFormError('Width and height cannot be greater than 50.');
            return;
        }

        try {
            setLoading(true);
            const createdGarden = await createGardenApi(
                userData.id,
                newGardenData.garden_name,
                width,
                height
            );
            console.log("Garden created successfully:", createdGarden);
            onGardenCreated(createdGarden);
            onClose();
        } catch (error) {
            console.error('Error creating garden:', error);
            setFormError(error.message || 'Failed to create garden.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 text-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold">Add New Garden</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleCreateGarden} className="space-y-4">
                    <div>
                        <label htmlFor="garden_name" className="block text-sm font-medium mb-1">Garden Name</label>
                        <input
                            type="text"
                            id="garden_name"
                            name="garden_name"
                            value={newGardenData.garden_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Summer Vegetables"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="width" className="block text-sm font-medium mb-1">Width (ft)</label>
                            <input
                                type="number"
                                id="width"
                                name="width"
                                value={newGardenData.width}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 10"
                            />
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium mb-1">Height (ft)</label>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                value={newGardenData.height}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 15"
                            />
                        </div>
                    </div>
                    {formError && <p className="text-red-400 text-sm text-center">{formError}</p>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-400 bg-neutral-700 rounded-md hover:bg-neutral-600 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium bg-green-700 rounded-md hover:bg-green-600 transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Garden'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGardenModal;
