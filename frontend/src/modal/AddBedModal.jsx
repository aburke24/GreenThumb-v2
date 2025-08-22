import React, { useState } from 'react';
import { createBedApi } from '../utils/bedUtil'; // adjust path accordingly

const AddBedModal = ({ isOpen, onClose, userId, gardenId, onSuccess }) => {
  const [bedName, setBedName] = useState('');
  const [width, setWidth] = useState(5);
  const [height, setHeight] = useState(5);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bedName.trim()) {
      setError('Bed name is required');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await createBedApi(userId, gardenId, {
        name: bedName.trim(),
        width: Number(width),
        height: Number(height),
        top_position: -1,
        left_position: -1,
      });
      
      setBedName('');
      setWidth(5);
      setHeight(5);
 
      onSuccess(); // notify parent to refresh beds
      onClose();   // close the modal
    } catch (apiError) {
      setError(apiError.message || 'Failed to create bed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-neutral-900 p-6 rounded-lg w-96 shadow-lg text-white">
        <h3 className="text-xl font-semibold mb-4">Add New Bed</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Bed Name</label>
            <input
              type="text"
              value={bedName}
              onChange={(e) => setBedName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
              placeholder="Enter bed name"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-1">Width</label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
                disabled={loading}
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1">Height</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
                disabled={loading}
              />
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBedModal;
