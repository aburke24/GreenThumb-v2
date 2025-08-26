// Tooltip.jsx
import React from 'react';

const Tooltip = ({ text, children }) => {
    return (
        <div className="relative group">
            {children}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {text}
            </span>
        </div>
    );
};

export default Tooltip;