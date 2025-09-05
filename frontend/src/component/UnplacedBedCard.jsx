import React from 'react';
import { Box } from 'lucide-react';
import planterPotImage from '../assets/planter-pot.png';

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

<img 
  src={planterPotImage} 
  alt="A planter pot" 
  style={{ width: '50px', height: '50px' }} 
/>    <span className="font-medium text-white text-center break-words">{bed.name}</span>
      <span className="text-xs text-gray-300 mt-1">
        {bed.width} x {bed.height}
      </span>
    </div>
  );
};


export default UnplacedBedCard;