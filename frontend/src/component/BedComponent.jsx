import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const BedComponent = ({
    bed,
    plants = [], // Add plants prop
    isUnsaved = false,
    onConfirm,
    onCancel,
    onResize,
}) => {
    const cellSize = 10;
    const { width, height, top_position, left_position } = bed;

    const [currentWidth, setCurrentWidth] = useState(width);
    const [currentHeight, setCurrentHeight] = useState(height);
    const [currentTop, setCurrentTop] = useState(top_position);
    const [currentLeft, setCurrentLeft] = useState(left_position);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        setCurrentWidth(width);
        setCurrentHeight(height);
        setCurrentTop(top_position);
        setCurrentLeft(left_position);
    }, [width, height, top_position, left_position]);

    const handleResize = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = currentWidth;
        const startHeight = currentHeight;
        const startTop = currentTop;
        const startLeft = currentLeft;

        const classList = e.currentTarget.classList;
        const isRight = classList.contains('right-handle');
        const isBottom = classList.contains('bottom-handle');
        const isLeft = classList.contains('left-handle');
        const isTop = classList.contains('top-handle');

        const doDrag = (e) => {
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newTop = startTop;
            let newLeft = startLeft;

            const moveX = e.clientX - startX;
            const moveY = e.clientY - startY;

            if (isRight) {
                newWidth = Math.max(1, startWidth + Math.round(moveX / cellSize));
            }
            if (isBottom) {
                newHeight = Math.max(1, startHeight + Math.round(moveY / cellSize));
            }
            if (isLeft) {
                const deltaW = Math.round(moveX / cellSize);
                newWidth = Math.max(1, startWidth - deltaW);
                if (newWidth > 0) {
                    newLeft = startLeft + deltaW;
                }
            }
            if (isTop) {
                const deltaH = Math.round(moveY / cellSize);
                newHeight = Math.max(1, startHeight - deltaH);
                if (newHeight > 0) {
                    newTop = startTop + deltaH;
                }
            }

            setCurrentWidth(newWidth);
            setCurrentHeight(newHeight);
            setCurrentTop(newTop);
            setCurrentLeft(newLeft);

            onResize?.({
                bed_id: bed.bed_id,
                newWidth,
                newHeight,
                newTop,
                newLeft,
            });
        };

        const stopDrag = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', doDrag);
            window.removeEventListener('mouseup', stopDrag);
        };

        window.addEventListener('mousemove', doDrag);
        window.addEventListener('mouseup', stopDrag);
    };

    // Helper function to get plant dimensions based on spacing (same as EditBedPage)
    const getPlantDimensions = (spacing) => {
        const s = parseInt(spacing);
        if (s === 1) return { width: 1, height: 1 };
        if (s === 4) return { width: 2, height: 2 };
        if (s === 9) return { width: 3, height: 3 };
        return { width: 1, height: 1 };
    };

    // Process plants to get their rendered positions and dimensions
    const processedPlants = plants.map(plant => {
        const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
        return {
            ...plant,
            plantWidth: plantW,
            plantHeight: plantH,
        };
    });

    // Render grid cells (with background color if occupied)
    const renderGridCells = () => {
        const cols = isUnsaved ? currentWidth : width;
        const rows = isUnsaved ? currentHeight : height;

        return Array.from({ length: cols * rows }).map((_, i) => {
            const x = i % cols;
            const y = Math.floor(i / cols);

            // Check if any plant covers this cell
            const isOccupied = processedPlants.some(plant => {
                return (
                    x >= plant.x_position &&
                    x < plant.x_position + plant.plantWidth &&
                    y >= plant.y_position &&
                    y < plant.y_position + plant.plantHeight
                );
            });

            // Cell background color classes based on occupancy
            let cellBgClass = isOccupied ? 'bg-[#3E2723]' : 'bg-[#4E342E]';

            return (
                <div
                    key={i}
                    className={`${cellBgClass}`}
                    style={{
                        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                    }}
                />
            );
        });
    };

    return (
        <div
            style={{
                width: (isUnsaved ? currentWidth : width) * cellSize,
                height: (isUnsaved ? currentHeight : height) * cellSize,
                backgroundColor: '#5b4343ff',
                border: isUnsaved ? '2px dashed red' : '1px solid rgba(255,255,255,0.4)',
                display: 'grid',
                gridTemplateColumns: `repeat(${isUnsaved ? currentWidth : width}, 1fr)`,
                gridTemplateRows: `repeat(${isUnsaved ? currentHeight : height}, 1fr)`,
                position: 'relative',
                boxSizing: 'border-box',
            }}
        >
            {renderGridCells()}

            {/* Render Plants */}
            {processedPlants.map((plant) => (
                <div
                    key={plant.id || plant.plant_id}
                    className="absolute z-20 items-center justify-center" // Added flex for centering
                    style={{
                        top: `${plant.y_position * cellSize}px`,
                        left: `${plant.x_position * cellSize}px`,
                        width: `${plant.plantWidth * cellSize}px`,
                        height: `${plant.plantHeight * cellSize}px`,
                        pointerEvents: 'none',
                        overflow: 'visible',
                    }}
                    title={`${plant.plant_name || plant.name} - ${plant.variety || 'No variety'}`}
                >
                    {plant.icon ? (
                        <img
                            src={plant.icon}
                            alt={plant.plant_name || plant.name}
                            style={{
                                pointerEvents: 'none',
                                width: '85%', // Slightly smaller to give padding
                                height: '85%', // Slightly smaller to give padding
                                objectFit: 'contain',
                            }}
                        />
                    ) : (
                        // Fallback if no icon is available
                        <div
                            className="w-full h-full rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold"
                            style={{ fontSize: `${Math.max(6, cellSize * 0.3)}px` }}
                        >
                            {(plant.plant_name || plant.name)?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                    )}
                </div>
            ))}

            {isUnsaved && onConfirm && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onConfirm({
                            ...bed,
                            top: currentTop,
                            left: currentLeft,
                            width: currentWidth,
                            height: currentHeight,
                        });
                    }}
                    className="absolute top-1 left-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-[2px] shadow z-30"
                    title="Confirm Placement"
                >
                    <Check className="w-3 h-3" />
                </button>
            )}

            {isUnsaved && onCancel && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-[2px] shadow z-30"
                    title="Cancel Placement"
                >
                    <X className="w-3 h-3" />
                </button>
            )}

            {/* Resize Handles (conditionally rendered only if unsaved) */}
            {isUnsaved && (
                <>
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize top-handle left-handle z-40" onMouseDown={handleResize} />
                    <div className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize top-handle right-handle z-40" onMouseDown={handleResize} />
                    <div className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize bottom-handle left-handle z-40" onMouseDown={handleResize} />
                    <div className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bottom-handle right-handle z-40" onMouseDown={handleResize} />

                    {/* Sides */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 cursor-ns-resize top-handle z-40" onMouseDown={handleResize} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 cursor-ns-resize bottom-handle z-40" onMouseDown={handleResize} />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-4 cursor-ew-resize left-handle z-40" onMouseDown={handleResize} />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 cursor-ew-resize right-handle z-40" onMouseDown={handleResize} />
                </>
            )}
        </div>
    );
};

export default BedComponent;