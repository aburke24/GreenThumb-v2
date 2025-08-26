// Bed.jsx

import React, { useEffect, useRef, useState } from 'react';

const Bed = ({
    width,
    height,
    bedLayout,
    onGridClick,
    activePlant,
    isDeleteMode,
    onCellHover, 
    onCellLeave, 
}) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const [localHoveredCell, setLocalHoveredCell] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    if (!bedLayout || bedLayout.length === 0 || bedLayout[0] === undefined) {
        console.warn("Bed.jsx: bedLayout is not yet available or is invalid.");
        return (
            <div
                ref={containerRef}
                className="flex items-center justify-center bg-[#4E342E] border relative shadow-inner overflow-hidden w-full h-full"
                style={{
                    border: '1px solid rgba(255,255,255,0.4)',
                }}
            >
                <p className="text-white/50">Loading bed...</p>
            </div>
        );
    }

    const cellSize = Math.min(dimensions.width / width, dimensions.height / height);
    const gridWidth = cellSize * width;
    const gridHeight = cellSize * height;

    const getPlantDimensions = (spacing) => {
        const s = parseInt(spacing);
        if (s === 1) return { width: 1, height: 1 };
        if (s === 4) return { width: 2, height: 2 };
        if (s === 9) return { width: 3, height: 3 };
        return { width: 1, height: 1 };
    };

    const bedPlants = [];
    const visitedCells = new Set();
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (bedLayout[r][c] !== null && !visitedCells.has(`${r}-${c}`)) {
                const plant = bedLayout[r][c];
                const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
                bedPlants.push({
                    ...plant,
                    top: r,
                    left: c,
                    plantWidth: plantW,
                    plantHeight: plantH,
                });
                for (let vr = r; vr < r + plantH; vr++) {
                    for (let vc = c; vc < c + plantW; vc++) {
                        visitedCells.add(`${vr}-${vc}`);
                    }
                }
            }
        }
    }

    // Function to check if a plant can be placed at the hovered position
    const canPlacePlant = (row, col) => {
        if (!activePlant) return false;
        const { width: plantW, height: plantH } = getPlantDimensions(activePlant.spacing);
        
        // Check if the plant would go out of bounds
        if (row + plantH > height || col + plantW > width) {
            return false;
        }

        // Check for overlaps with existing plants
        for (let r = row; r < row + plantH; r++) {
            for (let c = col; c < col + plantW; c++) {
                // Ensure r and c are within bedLayout bounds
                if (r >= 0 && r < height && c >= 0 && c < width) {
                    if (bedLayout[r][c] !== null) {
                        return false;
                    }
                } else {
                    // This case should ideally be caught by the out-of-bounds check above,
                    // but good for robustness.
                    return false;
                }
            }
        }
        return true;
    };

    const handleCellHover = (rowIndex, colIndex) => {
        setLocalHoveredCell({ row: rowIndex, col: colIndex });
        onCellHover({ row: rowIndex, col: colIndex });
    };

    const handleMouseLeave = () => {
        setLocalHoveredCell(null);
        onCellLeave();
    };

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center bg-neutral-800 relative shadow-inner overflow-hidden min-w-full min-h-full"
            style={{
                cursor: isDeleteMode ? 'crosshair' : activePlant ? 'crosshair' : 'default',
            }}
            onMouseLeave={handleMouseLeave}
        >
            <div
                style={{
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                    position: 'relative',
                }}
            >
                <div
                    className="absolute inset-0 grid z-10 border-2 border-white"
                    style={{
                        gridTemplateColumns: `repeat(${width}, 1fr)`,
                        gridTemplateRows: `repeat(${height}, 1fr)`,
                    }}
                >
                    {Array.from({ length: height }).map((_, rowIndex) =>
                        Array.from({ length: width }).map((_, colIndex) => {
                            const isOccupied = bedLayout[rowIndex][colIndex] !== null;
                            let cellBgClass = isOccupied ? 'bg-[#3E2723]' : 'bg-[#4E342E]';

                            // Preview color logic
                            if (!isDeleteMode && activePlant && localHoveredCell) {
                                const { width: plantW, height: plantH } = getPlantDimensions(activePlant.spacing);
                                const isHoveredArea = 
                                    rowIndex >= localHoveredCell.row && 
                                    rowIndex < localHoveredCell.row + plantH &&
                                    colIndex >= localHoveredCell.col &&
                                    colIndex < localHoveredCell.col + plantW;

                                if (isHoveredArea) {
                                    if (canPlacePlant(localHoveredCell.row, localHoveredCell.col)) {
                                        cellBgClass = 'bg-green-500 opacity-50'; // Semi-transparent green for valid placement
                                    } else {
                                        cellBgClass = 'bg-red-500 opacity-50'; // Semi-transparent red for invalid placement
                                    }
                                }
                            }

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`border border-white/10 ${cellBgClass}`}
                                    onClick={() => {
                                        if (!isDeleteMode) {
                                            onGridClick(rowIndex, colIndex);
                                        }
                                    }}
                                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                                />
                            );
                        })
                    )}
                </div>
                
                {/* No separate plant preview div needed anymore, as the cells themselves change color */}
                
                {bedPlants.map((plant) => {
                    const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
                    return (
                        <div
                            key={plant.id}
                            className="absolute z-20 flex items-center justify-center p-1"
                            style={{
                                top: `${plant.y_position * cellSize}px`,
                                left: `${plant.x_position * cellSize}px`,
                                width: `${plantW * cellSize}px`,
                                height: `${plantH * cellSize}px`,
                                cursor: isDeleteMode ? 'pointer' : 'default',
                            }}
                            onClick={(e) => {
                                if (isDeleteMode) {
                                    e.stopPropagation();
                                    onGridClick(plant.y_position, plant.x_position);
                                }
                            }}
                        >
                            <img
                                src={plant.icon}
                                alt={plant.common_name}
                                className="w-full h-full object-contain"
                                style={{ pointerEvents: 'none' }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Bed;