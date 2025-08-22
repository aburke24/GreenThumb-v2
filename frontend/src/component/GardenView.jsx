import React from 'react';
import { Pencil, Ban } from 'lucide-react';
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
    onEditBed,
    onUnplaceBed
}) => {
    const cellSize = 10;
    const [hoverCell, setHoverCell] = React.useState(null);

    // Get the selected bed's data, including its dimensions
    const selectedBed = beds.find(bed => bed.bed_id === selectedBedId);
    // Use the unsaved dimensions if they exist, otherwise use the bed's original dimensions
    const hoverBedWidth = unsavedPositions[selectedBedId]?.width || selectedBed?.width || 1;
    const hoverBedHeight = unsavedPositions[selectedBedId]?.height || selectedBed?.height || 1;

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

    // Handle mouse move over the garden grid
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const hoveredCol = Math.floor(offsetX / cellSize);
        const hoveredRow = Math.floor(offsetY / cellSize);

        // Check if a bed is selected and the hover area is within the garden bounds
        if (selectedBed && hoveredCol >= 0 && hoveredRow >= 0) {
            // Check if the hover box will fit completely within the garden
            const fits = 
                (hoveredCol + hoverBedWidth <= gardenWidth) && 
                (hoveredRow + hoverBedHeight <= gardenHeight);

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
                className="relative bg-[#4E342E] rounded-2xl shadow-inner border-2 border-[#3E2723] transition-transform duration-300 scale-100 max-[640px]:scale-75 origin-top"
                style={{
                    width: `${displayWidth}px`,
                    height: `${displayHeight}px`,
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

                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    const clickedCol = Math.floor(offsetX / cellSize);
                    const clickedRow = Math.floor(offsetY / cellSize);

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
                        className={`absolute pointer-events-none rounded-sm border ${hoverCell.fits ? 'bg-emerald-400/40 border-emerald-500' : 'bg-red-400/40 border-red-500'}`}
                        style={{
                            top: hoverCell.row * cellSize,
                            left: hoverCell.col * cellSize,
                            width: hoverBedWidth * cellSize,
                            height: hoverBedHeight * cellSize,
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
