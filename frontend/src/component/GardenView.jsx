import React, { useState, useEffect } from 'react';
import { Pencil, Ban } from 'lucide-react';
import BedComponent from './BedComponent';


const GardenView = ({
    gardenId,
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
    getBedPlants,
}) => {
    const cellSize = 10;
    const [hoverCell, setHoverCell] = useState(null);
    const [bedPlants, setBedPlants] = useState({});

      // Get the selected bed's data, including its dimensions
    const selectedBed = beds.find(bed => bed.id === selectedBedId);
    // Use the unsaved dimensions if they exist, otherwise use the bed's original dimensions
    const hoverBedWidth = unsavedPositions[selectedBedId]?.width || selectedBed?.width || 1;
    const hoverBedHeight = unsavedPositions[selectedBedId]?.height || selectedBed?.height || 1;

    useEffect(() => {
        const fetchPlantsForBeds = () => {
            const plantMap = {};
            beds.forEach(bed => {
                const plants = getBedPlants(gardenId, bed.id);
                plantMap[bed.id] = plants;
            });
            setBedPlants(plantMap);
        };

        if (beds.length > 0 && gardenId) {
            fetchPlantsForBeds();
        }
    }, [gardenId, beds, getBedPlants]);

    const handleResize = ({ id, newWidth, newHeight, newTop, newLeft }) => {
        setUnsavedPositions(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                width: newWidth,
                height: newHeight,
                top_position: newTop,
                left_position: newLeft
            },
        }));
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const hoveredCol = Math.floor(offsetX / cellSize);
        const hoveredRow = Math.floor(offsetY / cellSize);

        if (selectedBed && hoveredCol >= 0 && hoveredRow >= 0) {
            const fits =
                hoveredCol + hoverBedWidth <= gardenWidth &&
                hoveredRow + hoverBedHeight <= gardenHeight;

            setHoverCell({
                row: hoveredRow,
                col: hoveredCol,
                fits,
            });
        } else {
            setHoverCell(null);
        }
    };

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
                    width: `${gardenWidth * cellSize}px`,
                    height: `${gardenHeight * cellSize}px`,
                    minWidth: '50px',
                    minHeight: '50px',
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
                        onGardenClick({ row: clickedRow, col: clickedCol});
                    }
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <p className="absolute top-1 left-2 text-xs text-white/70 z-10">
                    {gardenWidth} x {gardenHeight}
                </p>

                {Array.from({ length: gardenWidth * gardenHeight }).map((_, index) => (
                    <div key={index} className="bg-[#4E342E]"></div>
                ))}

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

                {beds.map((bed) => {
                    const isUnsaved = bed.id in unsavedPositions;
                    const unsavedData = isUnsaved ? unsavedPositions[bed.id] : {};
                    const isSelected = selectedBedId === bed.id;

                    const currentBedData = {
                        ...bed,
                        ...unsavedData,
                    };

                    const {
                        top_position = 0,
                        left_position = 0,
                        width = 1,
                        height = 1,
                    } = currentBedData;

                    const isPlaced =
                        top_position >= 0 &&
                        left_position >= 0 &&
                        top_position + height <= gardenHeight &&
                        left_position + width <= gardenWidth;

                    return (
                        <div
                            key={bed.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectBed && onSelectBed(bed.id);
                            }}
                            className={`absolute cursor-pointer z-20 ${isSelected ? 'ring-4 ring-emerald-400' : ''}`}
                            style={{
                                top: top_position * cellSize,
                                left: left_position * cellSize,
                                width: width * cellSize,
                                height: height * cellSize,
                                opacity: isPlaced ? 1 : 0.5,
                            }}
                        >
                            <BedComponent
                                bed={currentBedData}
                                plants={bedPlants[bed.id] || []}
                                isUnsaved={isUnsaved}
                                onConfirm={(newBedData) => onConfirmPlacement(bed.id, newBedData)}
                                onCancel={() => onCancelPlacement(bed.id)}
                                onResize={(newBedData) => handleResize(newBedData)}
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
                })}
            </div>
        </div>
    );
};

export default GardenView;
