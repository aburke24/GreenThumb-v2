import React from 'react';
import { Pencil, Ban } from 'lucide-react'; // Import the icons you need
import BedComponent from './BedComponent';

const GardenView = ({
    gardenWidth,
    gardenHeight,
    displayWidth,
    displayHeight,
    beds = [],
    selectedBedId,
    onSelectBed,
    unsavedPositions,
    onConfirmPlacement,
    onCancelPlacement,
    onGardenClick,
    setSelectedBedId,
    setUnsavedPositions,
    onEditBed, // New props for the button handlers
    onUnplaceBed // New props for the button handlers
}) => {

    const cellSize = 10;

    // Handle resize from BedComponent
    const handleResize = ({ bed_id, newWidth, newHeight }) => {
        setUnsavedPositions(prev => ({
            ...prev,
            [bed_id]: {
                ...prev[bed_id],
                width: newWidth,
                height: newHeight,
            },
        }));
    };

    return (
        <div
            className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
            onClick={() => setSelectedBedId(null)}
        >
            <div
                className="relative bg-[#4E342E] rounded-2xl shadow-inner border-2 border-[#3E2723]"
                style={{
                    width: `${displayWidth}px`,
                    height: `${displayHeight}px`,
                    minWidth: '50px',
                    minHeight: '50px',
                    maxWidth: '500px',
                    maxHeight: '500px',
                    transition: 'width 0.3s, height 0.3s',
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

                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    const clickedCol = Math.floor(offsetX / cellSize);
                    const clickedRow = Math.floor(offsetY / cellSize);

                    if (onGardenClick) {
                        onGardenClick({ row: clickedRow, col: clickedCol });
                    }
                }}
            >
                <p className="absolute top-1 left-2 text-xs text-white/70 z-10">
                    {gardenWidth} x {gardenHeight}
                </p>

                {Array.from({ length: gardenWidth * gardenHeight }).map((_, index) => (
                    <div key={index} className="bg-[#4E342E]"></div>
                ))}

                {beds.map((bed) => {
                    const isUnsaved = bed.bed_id in unsavedPositions;
                    const unsavedData = unsavedPositions[bed.bed_id];
                    const isSelected = selectedBedId === bed.bed_id;

                    // Use unsaved data if available, otherwise use bed data
                    const currentBedData = isUnsaved
                        ? { ...bed, ...unsavedData }
                        : bed;

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
                                // This is the wrapper div where the selected bed's outline is applied
                                className={`absolute cursor-pointer z-20 ${isSelected ? 'ring-4 ring-emerald-400' : ''}`}
                                style={{
                                    top: currentBedData.top_position * cellSize,
                                    left: currentBedData.left_position * cellSize,
                                    width: currentBedData.width * cellSize,
                                    height: currentBedData.height * cellSize,
                                }}
                            >
                                <BedComponent
                                    bed={currentBedData}
                                    isUnsaved={isUnsaved}
                                    onConfirm={(newBedData) => onConfirmPlacement(bed.bed_id, newBedData)}
                                    onCancel={() => onCancelPlacement(bed.bed_id)}
                                    onResize={handleResize}
                                />
                                {/* ADD THE BUTTONS HERE */}
                                {isSelected && !isUnsaved && (
                                    <div className="absolute bottom-[-2.5rem] left-1/2 -translate-x-1/2 flex gap-1 z-30">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditBed(bed);
                                            }}
                                            // Updated classes for a button that matches the outline
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
                                            // Updated classes for a button that matches the outline
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