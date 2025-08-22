// src/components/BedComponent.jsx
import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const BedComponent = ({
    bed,
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

    const renderGridCells = () => {
        const cols = isUnsaved ? currentWidth : width;
        const rows = isUnsaved ? currentHeight : height;

        return Array.from({ length: cols * rows }).map((_, i) => (
            <div
                key={i}
                style={{
                    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                }}
            />
        ));
    };

    return (
        <div
            style={{
                width: (isUnsaved ? currentWidth : width) * cellSize,
                height: (isUnsaved ? currentHeight : height) * cellSize,
                backgroundColor: '#3B2F2F',
                border: isUnsaved ? '2px dashed red' : '1px solid rgba(255,255,255,0.4)',
                display: 'grid',
                gridTemplateColumns: `repeat(${isUnsaved ? currentWidth : width}, 1fr)`,
                gridTemplateRows: `repeat(${isUnsaved ? currentHeight : height}, 1fr)`,
                position: 'relative',
                boxSizing: 'border-box',
            }}
        >
            {renderGridCells()}

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
