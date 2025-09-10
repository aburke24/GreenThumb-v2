import React from 'react';
import { Box } from 'lucide-react';
import planterPotImage from '../assets/planter-pot.png';

/**
 * @typedef {object} Bed
 * @property {string} id - The unique identifier for the bed.
 * @property {string} name - The name of the bed.
 * @property {number} width - The width of the bed in grid units.
 * @property {number} height - The height of the bed in grid units.
 */

/**
 * A card component that represents a garden bed that has not yet been placed on the grid.
 * It displays the bed's name and dimensions, and provides buttons for editing and deleting.
 *
 * The card's appearance changes based on whether it is currently selected.
 *
 * @param {object} props - The component props.
 * @param {Bed} props.bed - The bed object to display.
 * @param {boolean} props.selected - A boolean indicating if this card is currently selected.
 * @param {Function} props.handleBedClick - Callback function to handle a click on the bed card.
 * @param {Function} props.handleDeleteBed - Callback function to handle the delete button click.
 * @param {Function} props.handleEditBed - Callback function to handle the edit button click.
 */
const UnplacedBedCard = ({ bed, selected, handleBedClick, handleDeleteBed, handleEditBed }) => {
  return (
    <div
      onClick={() => handleBedClick(bed)}
      className={`group relative w-24 h-28 rounded-xl shadow-lg border-2 flex flex-col items-center justify-center text-sm cursor-pointer p-2 transition-all ${
        selected
          ? 'bg-emerald-700 border-emerald-500 ring-2 ring-emerald-400'
          : 'bg-[#7B3F00] border-[#5C4033]'
      }`}
    >
      {/* Delete button, visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteBed(bed.id);
        }}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete bed"
      >
        ×
      </button>

      {/* Edit button, visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEditBed(bed);
        }}
        className="absolute bottom-1 w-[85%] h-7 bg-blue-600 text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        title="Edit bed"
      >
        Edit Bed
      </button>

      {/* Visual representation of the bed card */}
      <img 
        src={planterPotImage} 
        alt="A planter pot" 
        style={{ width: '50px', height: '50px' }} 
      />
      {/* Display bed name */}
      <span className="font-medium text-white text-center break-words">{bed.name}</span>
      {/* Display bed dimensions */}
      <span className="text-xs text-gray-300 mt-1">
        {bed.width} x {bed.height}
      </span>
    </div>
  );
};


export default UnplacedBedCard;