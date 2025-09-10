import React, { useState } from 'react';
import { createBedApi } from '../utils/bedUtil';

/**
 * A modal component for adding a new garden bed.
 *
 * This modal allows the user to input a name, width, and height for a new bed.
 * It performs basic validation and calls an API to create the bed.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - A boolean indicating whether the modal is open.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {string} props.userId - The ID of the current user.
 * @param {object} props.garden - The garden object, containing its dimensions.
 * @param {Function} props.onSuccess - Callback to execute after a bed is successfully created.
 */
const AddBedModal = ({ isOpen, onClose, userId, garden, onSuccess }) => {

  const [bedName, setBedName] = useState('');
  const [width, setWidth] = useState(5);
  const [height, setHeight] = useState(5);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const gardenId = garden.id;

  if (!isOpen) return null;

  /**
   * Handles the form submission for creating a new bed.
   * Performs validation before attempting to create the bed.
   * @param {object} e - The form event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!bedName.trim()) {
      setError('Bed name is required');
      return;
    }
    
    if (!garden) {
        setError('Garden not found.');
        return;
    }

    const maxWidth = garden.width;
    const maxHeight = garden.height;

    const bedWidth = Number(width);
    const bedHeight = Number(height);
    
    if (bedWidth <= 0 || bedHeight <= 0) {
        setError('Width and height must be positive numbers.');
        return;
    }

    if (bedWidth > maxWidth) {
        setError(`Width cannot be greater than the garden's width (${maxWidth}ft).`);
        return;
    }

    if (bedHeight > maxHeight) {
        setError(`Height cannot be greater than the garden's height (${maxHeight}ft).`);
        return;
    }

    setLoading(true);

    try {
      await createBedApi(userId, gardenId, {
        name: bedName.trim(),
        width: bedWidth,
        height: bedHeight,
        top_position: -1,
        left_position: -1,
      });
      
      // Reset form fields after successful creation
      setBedName('');
      setWidth(5);
      setHeight(5);
 
      onSuccess(); // Notify parent component of success
      onClose();   
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