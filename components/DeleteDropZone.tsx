import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useDragState } from '../contexts/DragStateContext';

interface DeleteDropZoneProps {
    isDragging: boolean;
}

const DeleteDropZone: React.FC<DeleteDropZoneProps> = ({ isDragging }) => {
    const { themeConfig } = useTheme();
    const { isDraggingRoutine } = useDragState();
    const [isOver, setIsOver] = useState(false);

    // Note: The actual drop logic is handled by the global 'mouseup'/'touchend' listener
    // in the RoutinesView component, which checks if the cursor is over this zone.
    // These handlers are here to provide visual feedback.

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        // Prevent default to allow drop
        e.preventDefault();
    };

    const baseStyle = 'fixed bottom-0 left-0 right-0 h-24 z-20 flex items-center justify-center transition-all duration-300 ease-in-out pointer-events-none';
    const visibilityStyle = isDraggingRoutine ? 'translate-y-0' : 'translate-y-full';
    const overStyle = isOver ? 'bg-red-500/30' : 'bg-black/30';

    return (
        <div
            id="delete-zone"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            className={`${baseStyle} ${visibilityStyle} ${overStyle} backdrop-blur-md border-t border-white/10`}
            aria-hidden={!isDraggingRoutine}
            style={{ pointerEvents: isDraggingRoutine ? 'auto' : 'none' }}
        >
            <div className="flex flex-col items-center pointer-events-none">
                <svg className={`h-8 w-8 transition-colors ${isOver ? 'text-red-300' : themeConfig.subtextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <p className={`mt-1 font-semibold transition-colors ${isOver ? 'text-red-300' : themeConfig.subtextColor}`}>
                    Drop to Delete
                </p>
            </div>
        </div>
    );
};

export default DeleteDropZone;