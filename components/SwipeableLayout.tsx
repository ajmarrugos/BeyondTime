import React, { useRef, useState, useCallback } from 'react';
import { useDevice } from '../contexts/DeviceContext';
import { SWIPE_THRESHOLD } from '../config/constants';
import { vibrate } from '../utils/haptics';

interface SwipeableLayoutProps {
    currentView: number;
    viewCount: number;
    onViewChange: (viewIndex: number) => void;
    isInteractionDisabled: boolean;
    children: React.ReactNode;
}

const SwipeableLayout: React.FC<SwipeableLayoutProps> = ({
    currentView,
    viewCount,
    onViewChange,
    isInteractionDisabled,
    children
}) => {
    const { isDesktop } = useDevice();
    const [isSwiping, setIsSwiping] = useState(false);
    const touchStartX = useRef<number>(0);
    const swipeOffset = useRef<number>(0);
    const mainContainerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isInteractionDisabled || isDesktop) return;

        let target = e.target as HTMLElement | null;
        while (target && target !== e.currentTarget) {
            if (target.hasAttribute('data-no-swipe')) {
                return;
            }
            target = target.parentElement;
        }

        touchStartX.current = e.touches[0].clientX;
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping || isInteractionDisabled || isDesktop) return;
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchStartX.current;
        swipeOffset.current = deltaX;
        if (mainContainerRef.current) {
            const baseOffset = -currentView * mainContainerRef.current.offsetWidth;
            mainContainerRef.current.style.transform = `translateX(${baseOffset + swipeOffset.current}px)`;
        }
    };

    const handleTouchEnd = () => {
        if (!isSwiping || isInteractionDisabled || isDesktop) return;

        let viewChanged = false;
        if (Math.abs(swipeOffset.current) > SWIPE_THRESHOLD) {
            if (swipeOffset.current < 0 && currentView < viewCount - 1) { // Swipe left
                onViewChange(currentView + 1);
                viewChanged = true;
            } else if (swipeOffset.current > 0 && currentView > 0) { // Swipe right
                onViewChange(currentView - 1);
                viewChanged = true;
            }
        }
        
        if (viewChanged) {
            vibrate();
        }

        setIsSwiping(false);
        swipeOffset.current = 0;
        if (mainContainerRef.current) {
            mainContainerRef.current.style.transform = `translateX(-${currentView * 100}%)`;
        }
    };

    const transformStyle: React.CSSProperties = {
        transform: `translateX(-${currentView * 100}%)`,
        transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    return (
        <div
            className="flex-grow w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                ref={mainContainerRef}
                className="flex w-full h-full"
                style={transformStyle}
            >
                {children}
            </div>
        </div>
    );
};

export default SwipeableLayout;
