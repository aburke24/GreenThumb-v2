import React, { useEffect, useState } from 'react';
import { Pencil, Ban } from 'lucide-react';
import BedComponent from './BedComponent';

const GardenView = ({
  gardenWidth,
  gardenHeight,
  beds = [],
  selectedBedId,
  onSelectBed,
  unsavedPositions,
  onConfirmPlacement,
  onCancelPlacement,
  onGardenClick,
  setSelectedBedId,
  setUnsavedPositions,
  onEditBed,
  onUnplaceBed,
}) => {
  const cellSize = 10;

  // Base size of garden view (pixels)
  const baseWidth = gardenWidth * cellSize;
  const baseHeight = gardenHeight * cellSize;

  const [containerSize, setContainerSize] = useState({ width: baseWidth, height: baseHeight });
  const [hoverCell, setHoverCell] = useState(null);

  // Calculate scale to keep garden view within max viewport size and keep cells square
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth * 0.9;  // 90% of viewport width
      const maxHeight = window.innerHeight * 0.6; // 60% of viewport height

      const scaleWidth = maxWidth / baseWidth;
      const scaleHeight = maxHeight / baseHeight;
      const scale = Math.min(scaleWidth, scaleHeight, 1); // don't scale above 1 (original size)

      setContainerSize({
        width: baseWidth * scale,
        height: baseHeight * scale,
      });
    };

    handleResize(); // initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [baseWidth, baseHeight]);

  // Get the selected bed's data, including its dimensions
  const selectedBed = beds.find((bed) => bed.bed_id === selectedBedId);

  // Use the unsaved dimensions if they exist, otherwise use the bed's original dimensions
  const hoverBedWidth = unsavedPositions[selectedBedId]?.width || selectedBed?.width || 1;
  const hoverBedHeight = unsavedPositions[selectedBedId]?.height || selectedBed?.height || 1;

  // Handle resize from BedComponent
  const handleResize = ({ bed_id, newWidth, newHeight }) => {
    setUnsavedPositions((prev) => ({
      ...prev,
      [bed_id]: {
        ...prev[bed_id],
        width: newWidth,
        height: newHeight,
      },
    }));
  };

  // Handle mouse move over the garden grid
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Because the container size can scale, we need to map the mouse position back to the grid cells correctly
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Calculate cell size based on current container size (for scaled views)
    const currentCellWidth = containerSize.width / gardenWidth;
    const currentCellHeight = containerSize.height / gardenHeight;

    const hoveredCol = Math.floor(offsetX / currentCellWidth);
    const hoveredRow = Math.floor(offsetY / currentCellHeight);

    if (selectedBed && hoveredCol >= 0 && hoveredRow >= 0) {
      const fits =
        hoveredCol + hoverBedWidth <= gardenWidth &&
        hoveredRow + hoverBedHeight <= gardenHeight;

      setHoverCell({
        row: hoveredRow,
        col: hoveredCol,
        fits: fits,
      });
    } else {
      setHoverCell(null);
    }
  };

  // Clear hover when mouse leaves grid
  const handleMouseLeave = () => {
    setHoverCell(null);
  };

  return (
    <div
      className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      onClick={() => setSelectedBedId(null)}
    >
      <div
        className="relative bg-[#4E342E] rounded-2xl shadow-inner border-2 border-[#3E2723]"
        style={{
          width: `${containerSize.width}px`,
          height: `${containerSize.height}px`,
          minWidth: '50px',
          minHeight: '50px',
          maxWidth: '500px',
          maxHeight: '500px',
          backgroundColor: '#3E2723',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${gardenWidth}, 1fr)`,
          gridTemplateRows: `repeat(${gardenHeight}, 1fr)`,
          gap: '1px',
          userSelect: 'none',
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Calculate clicked cell based on current cell size (scaled)
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;

          const currentCellWidth = containerSize.width / gardenWidth;
          const currentCellHeight = containerSize.height / gardenHeight;

          const clickedCol = Math.floor(offsetX / currentCellWidth);
          const clickedRow = Math.floor(offsetY / currentCellHeight);

          if (onGardenClick) {
            onGardenClick({ row: clickedRow, col: clickedCol });
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <p className="absolute top-1 left-2 text-xs text-white/70 z-10">
          {gardenWidth} x {gardenHeight}
        </p>

        {/* Garden grid cells */}
        {Array.from({ length: gardenWidth * gardenHeight }).map((_, index) => (
          <div key={index} className="bg-[#4E342E]"></div>
        ))}

        {/* Hover preview cell */}
        {hoverCell && (
          <div
            className={`absolute pointer-events-none rounded-sm border ${
              hoverCell.fits
                ? 'bg-emerald-400/40 border-emerald-500'
                : 'bg-red-400/40 border-red-500'
            }`}
            style={{
              top: (hoverCell.row * containerSize.height) / gardenHeight,
              left: (hoverCell.col * containerSize.width) / gardenWidth,
              width: (hoverBedWidth * containerSize.width) / gardenWidth,
              height: (hoverBedHeight * containerSize.height) / gardenHeight,
              zIndex: 15,
            }}
          />
        )}

        {/* Render beds */}
        {beds.map((bed) => {
          const isUnsaved = bed.bed_id in unsavedPositions;
          const unsavedData = unsavedPositions[bed.bed_id];
          const isSelected = selectedBedId === bed.bed_id;

          const currentBedData = {
            ...bed,
            top_position: isUnsaved ? unsavedData.top : bed.top_position,
            left_position: isUnsaved ? unsavedData.left : bed.left_position,
            width: isUnsaved ? unsavedData.width : bed.width,
            height: isUnsaved ? unsavedData.height : bed.height,
          };

          if (
            currentBedData.left_position >= 0 &&
            currentBedData.top_position >= 0 &&
            currentBedData.left_position + currentBedData.width <= gardenWidth &&
            currentBedData.top_position + currentBedData.height <= gardenHeight
          ) {
            return (
              <div
                key={bed.bed_id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBed && onSelectBed(bed.bed_id);
                }}
                className={`absolute cursor-pointer z-20 ${
                  isSelected ? 'ring-4 ring-emerald-400' : ''
                }`}
                style={{
                  top:
                    (currentBedData.top_position * containerSize.height) /
                    gardenHeight,
                  left:
                    (currentBedData.left_position * containerSize.width) /
                    gardenWidth,
                  width:
                    (currentBedData.width * containerSize.width) / gardenWidth,
                  height:
                    (currentBedData.height * containerSize.height) / gardenHeight,
                }}
              >
                <BedComponent
                  bed={currentBedData}
                  isUnsaved={isUnsaved}
                  onConfirm={(newBedData) =>
                    onConfirmPlacement(bed.bed_id, newBedData)
                  }
                  onCancel={() => onCancelPlacement(bed.bed_id)}
                  onResize={handleResize}
                />
                {isSelected && !isUnsaved && (
                  <div className="absolute bottom-[-2.5rem] left-1/2 -translate-x-1/2 flex gap-1 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBed(bed);
                      }}
                      className="bg-emerald-600/70 hover:bg-emerald-500 text-white rounded-full p-1"
                      title="Edit Bed"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnplaceBed(bed);
                      }}
                      className="bg-emerald-600/70 hover:bg-emerald-500 text-white rounded-full p-1"
                      title="Unplace Bed"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default GardenView;
