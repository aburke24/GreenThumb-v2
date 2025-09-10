import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders a plant bed grid UI allowing for plant placement, previewing, and deletion.
 * @param {number} width - Number of columns in the grid.
 * @param {number} height - Number of rows in the grid.
 * @param {Array} bedLayout - 2D array representing the plant layout.
 * @param {Function} onGridClick - Callback when a cell is clicked.
 * @param {Object} activePlant - The plant object currently selected for placement.
 * @param {boolean} isDeleteMode - Whether the app is in delete mode.
 * @param {Function} onCellHover - Callback when a cell is hovered.
 * @param {Function} onCellLeave - Callback when the cursor leaves the grid.
 * @param {boolean} isDragging - Whether the mouse is currently dragging.
 * @param {Function} setIsDragging - Setter for dragging state.
 */
const Bed = ({
    width,
    height,
    bedLayout,
    onGridClick,
    activePlant,
    isDeleteMode,
    onCellHover,
    onCellLeave,
    isDragging,
    setIsDragging
}) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [localHoveredCell, setLocalHoveredCell] = useState(null);

    /**
     * Observes container size changes and updates internal dimensions accordingly.
     */
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Early return if the bed layout is invalid or not yet available
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

    /**
     * Converts plant spacing into grid dimensions (width x height).
     * @param {number|string} spacing - Spacing value indicating size.
     * @returns {Object} Object containing width and height.
     */
    const getPlantDimensions = (spacing) => {
        const s = parseInt(spacing);
        if (s === 1) return { width: 1, height: 1 };
        if (s === 4) return { width: 2, height: 2 };
        if (s === 9) return { width: 3, height: 3 };
        return { width: 1, height: 1 };
    };

    // Build an array of placed plants, accounting for their size and positions
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

    /**
     * Determines whether the currently selected plant can be placed at a given position.
     * @param {number} row - Row index.
     * @param {number} col - Column index.
     * @returns {boolean} True if placement is valid; otherwise, false.
     */
    const canPlacePlant = (row, col) => {
        if (!activePlant) return false;
        const { width: plantW, height: plantH } = getPlantDimensions(activePlant.spacing);

        if (row + plantH > height || col + plantW > width) {
            return false;
        }

        for (let r = row; r < row + plantH; r++) {
            for (let c = col; c < col + plantW; c++) {
                if (r >= 0 && r < height && c >= 0 && c < width) {
                    if (bedLayout[r][c] !== null) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Handles mouse hover over a cell.
     * @param {number} rowIndex - Row index of the cell.
     * @param {number} colIndex - Column index of the cell.
     */
    const handleCellHover = (rowIndex, colIndex) => {
        setLocalHoveredCell({ row: rowIndex, col: colIndex });
        onCellHover({ row: rowIndex, col: colIndex });
    };

    /**
     * Handles mouse leaving the grid area.
     */
    const handleMouseLeave = () => {
        setLocalHoveredCell(null);
        onCellLeave();
    };

    // Whether to show a plant preview at the hovered cell
    const previewPlant = activePlant && !isDeleteMode && localHoveredCell;
    const previewPosition = previewPlant ? {
        top: localHoveredCell.row * cellSize,
        left: localHoveredCell.col * cellSize,
        width: getPlantDimensions(activePlant.spacing).width * cellSize,
        height: getPlantDimensions(activePlant.spacing).height * cellSize,
    } : null;

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center bg-neutral-800 relative shadow-inner overflow-hidden min-w-full min-h-full"
            style={{
                cursor: isDeleteMode ? 'crosshair' : activePlant ? 'crosshair' : 'default',
            }}
            onMouseLeave={handleMouseLeave}
            onMouseUp={() => setIsDragging(false)}
        >
            <div
                style={{
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                    position: 'relative',
                }}
            >
                {/* Grid layer */}
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

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`border border-white/10 ${cellBgClass}`}
                                    onMouseDown={() => {
                                        setIsDragging(true);
                                        onGridClick(rowIndex, colIndex);
                                    }}
                                    onMouseEnter={() => {
                                        handleCellHover(rowIndex, colIndex);

                                        if (isDragging) {
                                            onGridClick(rowIndex, colIndex);
                                        }
                                    }}
                                />
                            );
                        })
                    )}
                </div>

                {/* Conditional: Render preview of plant at hover location */}
                {previewPlant && (
                    <div
                        className="absolute z-30 pointer-events-none transition-opacity duration-100 ease-in-out flex items-center justify-center p-1"
                        style={{
                            ...previewPosition,
                            opacity: 0.7,
                            borderColor: canPlacePlant(localHoveredCell.row, localHoveredCell.col) ? 'green' : 'red',
                            borderWidth: '2px',
                            borderStyle: 'solid',
                        }}
                    >
                        <img
                            src={activePlant.icon}
                            alt={activePlant.common_name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}

                {/* Render placed plants on the grid */}
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
