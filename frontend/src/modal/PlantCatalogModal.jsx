import React from 'react';
import { X } from 'lucide-react';
import PlantCatalog from '../plantCatalog.json';

/**
 * A modal component that displays a catalog of available plants.
 *
 * This modal allows the user to browse a list of plants and select one to add to a garden bed.
 * Plants that are already on the active buttons list are disabled to prevent duplicate selections.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - A boolean indicating whether the modal is open.
 * @param {Function} props.onClose - A callback function to close the modal.
 * @param {Function} props.onSelect - A callback function to handle the selection of a plant.
 * @param {string|null} props.selectedPlantId - The ID of the currently selected plant.
 * @param {Array} props.activePlantButtons - An array of plant objects that are already in use, to be disabled in the catalog.
 */
const PlantCatalogModal = ({ isOpen, onClose, onSelect, selectedPlantId, activePlantButtons }) => {
    if (!isOpen) {
        return null;
    }

    const activePlantIds = new Set(
        activePlantButtons
            .filter((plant) => plant !== null)
            .map((plant) => plant.plant_id)
    );

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Modal container: Constrained height, responsive width, centered */}
            <div
                className="bg-neutral-900 text-white rounded-lg shadow-lg w-full max-w-[90vw] sm:max-w-[80vw] max-h-[80vh] p-4 relative mx-4 flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent clicks from closing modal
            >
                {/* Header with Close Button */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-center flex-1">Select a New Plant</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-neutral-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable plant grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
                        {PlantCatalog.map((plant) => {
                            // Check if the plant is disabled based on the active buttons list
                            const isDisabled = activePlantIds.has(plant.plant_id);
                            return (
                                <button
                                    key={plant.plant_id}
                                    onClick={() => !isDisabled && onSelect(plant)}
                                    disabled={isDisabled}
                                    className={`flex flex-col items-center justify-center aspect-square p-2 rounded-lg transition-all ${
                                        selectedPlantId === plant.plant_id
                                            ? 'bg-blue-600 ring-2 ring-blue-400'
                                            : isDisabled
                                            ? 'bg-neutral-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-neutral-800 hover:bg-neutral-700'
                                    }`}
                                >
                                    {/* Plant icon */}
                                    <img
                                        src={plant.icon}
                                        alt={plant.common_name}
                                        className="w-2/3 h-2/3 max-w-[48px] max-h-[48px] mb-1 object-contain"
                                    />
                                    {/* Plant common name */}
                                    <span className="text-xs text-center line-clamp-2">{plant.common_name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlantCatalogModal;