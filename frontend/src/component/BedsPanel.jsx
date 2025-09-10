import React from 'react';
import UnplacedBedCard from '../component/UnplacedBedCard';

/**
 * BedsPanel component displays a collapsible panel of garden beds.
 * It supports toggling between placed and unplaced beds, resizing via drag,
 * and managing individual bed cards (edit, delete, select).
 *
 * @param {Array} gardenBeds - Array of bed objects.
 * @param {boolean} showUnplacedBeds - Whether to show only unplaced beds.
 * @param {Function} setShowUnplacedBeds - Setter to toggle placed/unplaced view.
 * @param {boolean} isBedsOpen - Whether the panel is expanded.
 * @param {Function} toggleBeds - Toggles the panel open or collapsed.
 * @param {number} bedPanelHeight - Current height of the panel (in pixels).
 * @param {object} isDragging - React ref to determine if panel is being resized.
 * @param {Function} handleMouseDown - Handles drag to resize panel.
 * @param {string} selectedBedId - ID of the currently selected bed.
 * @param {Function} handleCardClick - Callback for clicking on a bed card.
 * @param {Function} handleDeleteBed - Callback to delete a bed.
 * @param {Function} handleEditBed - Callback to edit a bed.
 */
const BedsPanel = ({
  gardenBeds,
  showUnplacedBeds,
  setShowUnplacedBeds,
  isBedsOpen,
  toggleBeds,
  bedPanelHeight,
  isDragging,
  handleMouseDown,
  selectedBedId,
  handleCardClick,
  handleDeleteBed,
  handleEditBed,
}) => {
  
  /**
   * Filters gardenBeds based on placement status.
   * Shows either placed or unplaced beds depending on showUnplacedBeds.
   */
  const bedsToDisplay = gardenBeds.filter((bed) =>
    showUnplacedBeds
      ? bed.left_position === -1 && bed.top_position === -1
      : bed.left_position >= 0 && bed.top_position >= 0
  );

  return (
    <div
      className="bg-neutral-900 border-t border-neutral-700 shadow-inner relative"
      style={{ height: bedPanelHeight, transition: isDragging.current ? 'none' : 'height 0.3s' }}
    >
      {/* ─── Drag Handle: Resizes the panel height ───────────────────────────── */}
      <div
        onMouseDown={handleMouseDown}
        className="h-4 cursor-ns-resize bg-neutral-800 flex items-center justify-center select-none"
        title="Drag to resize"
      >
        <div className="w-10 h-1 rounded-full bg-neutral-600"></div>
      </div>

      {/* ─── Header: Collapse Toggle and Bed Type Switch ────────────────────── */}
      <div className="flex items-center w-full p-4 sm:p-6 space-x-4">
        {/* Collapse toggle button (arrow icon) */}
        <button
          onClick={toggleBeds}
          className="flex items-center justify-center text-white cursor-pointer select-none"
          title={isBedsOpen ? 'Collapse' : 'Expand'}
          style={{ width: '2rem', height: '2rem' }}
        >
          <svg
            className={`w-6 h-6 transform transition-transform duration-300 ${
              isBedsOpen ? 'rotate-180' : 'rotate-0'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        {/* Toggle between placed and unplaced beds */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowUnplacedBeds(false)}
            className={`px-3 py-1 rounded-lg font-semibold ${
              !showUnplacedBeds ? 'bg-emerald-600 text-white' : 'bg-neutral-700 text-gray-300'
            }`}
          >
            Placed Beds
          </button>
          <button
            onClick={() => setShowUnplacedBeds(true)}
            className={`px-3 py-1 rounded-lg font-semibold ${
              showUnplacedBeds ? 'bg-emerald-600 text-white' : 'bg-neutral-700 text-gray-300'
            }`}
          >
            Unplaced Beds
          </button>
        </div>
      </div>

      {/* ─── Bed Cards Display Area ─────────────────────────────────────────── */}
      <div
        className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto"
        style={{ height: `calc(${bedPanelHeight}px - 60px)` }}
      >
        <div className="flex flex-wrap gap-4">
          {bedsToDisplay.length > 0 ? (
            bedsToDisplay.map((bed) => (
              <UnplacedBedCard
                key={bed.id}
                bed={bed}
                selected={selectedBedId === bed.id}
                handleBedClick={handleCardClick}
                handleDeleteBed={handleDeleteBed}
                handleEditBed={handleEditBed}
              />
            ))
          ) : (
            <p className="text-gray-400">
              {showUnplacedBeds ? 'No unplaced beds found.' : 'No placed beds found.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BedsPanel;
