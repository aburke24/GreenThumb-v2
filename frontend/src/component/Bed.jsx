import React, { useEffect, useRef, useState } from 'react';

const Bed = ({
    width,
    height,
    isUnsaved = false,
    bedLayout,
    onGridClick,
    activePlant,
    isDeleteMode
}) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // ⬅️ Add a check here
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

    // Now, `bedLayout` is guaranteed to be a valid array.
    const cellSize = Math.min(dimensions.width / width, dimensions.height / height);

    const gridWidth = cellSize * width;
    const gridHeight = cellSize * height;

    const bedPlants = [];
    const visitedCells = new Set();

    const getPlantDimensions = (spacing) => {
        const s = parseInt(spacing);
        if (s === 1) return { width: 1, height: 1 };
        if (s === 4) return { width: 2, height: 2 };
        if (s === 9) return { width: 3, height: 3 };
        return { width: 1, height: 1 };
    };
    
    // The for loop is safe now
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

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center bg-[#4E342E] border relative shadow-inner overflow-hidden w-full h-full"
            style={{
                border: isUnsaved ? '2px dashed #EF4444' : '1px solid rgba(255,255,255,0.4)',
                cursor: isDeleteMode ? 'crosshair' : activePlant ? 'crosshair' : 'default',
            }}
        >
            <div
                style={{
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                    position: 'relative',
                }}
            >
                <div
                    className="absolute inset-0 grid z-10"
                    style={{
                        gridTemplateColumns: `repeat(${width}, 1fr)`,
                        gridTemplateRows: `repeat(${height}, 1fr)`,
                    }}
                >
                    {Array.from({ length: height }).map((_, rowIndex) =>
                        Array.from({ length: width }).map((_, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className="border border-white/10"
                                onClick={() => {
                                    if (!isDeleteMode) {
                                        onGridClick(rowIndex, colIndex);
                                    }
                                }}
                            />
                        ))
                    )}
                </div>

                {bedPlants.map((plant) => {
                    const { width: plantW, height: plantH } = getPlantDimensions(plant.spacing);
                    return (
                        <div
                            key={plant.id} // Use the unique ID as the key
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