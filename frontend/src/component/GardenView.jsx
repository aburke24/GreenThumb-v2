import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Ban } from 'lucide-react';
import BedComponent from './BedComponent';
import { useUser } from '../hooks/UserUser';

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
    onUnplaceBed
}) => {
    const containerRef = useRef(null);
    const [cellSize, setCellSize] = useState(10);
    const [hoverCell, setHoverCell] = useState(null);
    const [bedPlants, setBedPlants] = useState({});

    const selectedBed = beds.find(bed => bed.id === selectedBedId);
    const hoverBedWidth = unsavedPositions[selectedBedId]?.width || selectedBed?.width || 1;
    const hoverBedHeight = unsavedPositions[selectedBedId]?.height || selectedBed?.height || 1;

    useEffect(() => {
        const fetchPlantsForBeds = () => {
            const plantMap = {};
            beds.forEach(bed => {
                const plants = bed.plants;
                plantMap[bed.id] = plants;
            });
            console.log("The bed plants are ", plantMap);
            setBedPlants(plantMap);
        };

        if (beds.length > 0 && gardenId) {
            fetchPlantsForBeds();
        }
    }, [gardenId, beds]);

    useEffect(() => {
        const updateCellSize = () => {
            if (!containerRef.current) return;

            const { width, height } = containerRef.current.getBoundingClientRect();

            const availableCellWidth = width / gardenWidth;
            const availableCellHeight = height / gardenHeight;

            const newCellSize = Math.max(10, Math.min(40, Math.floor(Math.min(availableCellWidth, availableCellHeight))));
            setCellSize(newCellSize);
        };

        updateCellSize();

        window.addEventListener('resize', updateCellSize);
        return () => window.removeEventListener('resize', updateCellSize);
    }, [gardenWidth, gardenHeight]);

    const handleResize = ({ id, newWidth, newHeight, newTop, newLeft }) => {
        // Remove plants that don't fit inside newWidth x newHeight bed


        // Update unsaved positions as before
        setUnsavedPositions((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                width: newWidth,
                height: newHeight,
                top: newTop,
                left: newLeft,
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
            ref={containerRef}
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
                        onGardenClick({ row: clickedRow, col: clickedCol });
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

                {beds.filter(bed => {
                    const isUnplaced = bed.top_position === -1 && bed.left_position === -1;
                    const isBeingPlaced = selectedBedId === bed.id;
                    return !isUnplaced || isBeingPlaced;
                }).map((bed) => {
                    const isUnsaved = bed.id in unsavedPositions;
                    const unsavedData = unsavedPositions[bed.id] || {};

                    const top_position = unsavedData.top ?? bed.top_position;
                    const left_position = unsavedData.left ?? bed.left_position;
                    const width = unsavedData.width ?? bed.width;
                    const height = unsavedData.height ?? bed.height;

                    const isSelected = selectedBedId === bed.id;

                    if (isSelected && top_position === -1 && left_position === -1) {
                        return null;
                    }
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
                                bed={{
                                    ...bed,
                                    width,
                                    height,
                                    top_position,
                                    left_position,
                                }}
                                plants={bedPlants[bed.id] || []}
                                isUnsaved={isUnsaved}
                                isSelected={isSelected}
                                onConfirm={(newBedData) => onConfirmPlacement(bed.id, newBedData)}
                                onCancel={() => onCancelPlacement(bed.id)}
                                onResize={(newBedData) => handleResize(newBedData)} cellSize={cellSize}
                          
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
