import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface UseVirtualizationProps {
    itemCount: number;
    getItemHeight: (index: number) => number;
    containerRef: React.RefObject<HTMLElement>;
    overscan?: number;
}

export const useVirtualization = ({ 
    itemCount, 
    getItemHeight, 
    containerRef,
    overscan = 5 
}: UseVirtualizationProps) => {
    const [scrollTop, setScrollTop] = useState(0);

    const handleScroll = useCallback(() => {
        if (containerRef.current) {
            setScrollTop(containerRef.current.scrollTop);
        }
    }, [containerRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [containerRef, handleScroll]);

    // Pre-calculate positions and total height for variable-height items.
    const { itemPositions, totalHeight } = useMemo(() => {
        const positions = [];
        let currentPosition = 0;
        for (let i = 0; i < itemCount; i++) {
            positions.push(currentPosition);
            currentPosition += getItemHeight(i);
        }
        return { itemPositions: positions, totalHeight: currentPosition };
    }, [itemCount, getItemHeight]);


    const containerHeight = containerRef.current?.clientHeight || 0;
    
    // Find the range of visible items using a linear scan.
    // This is efficient enough for lists up to a few thousand items.
    let startIndex = 0;
    while (startIndex < itemCount - 1 && itemPositions[startIndex] + getItemHeight(startIndex) < scrollTop) {
        startIndex++;
    }

    let endIndex = startIndex;
    while (endIndex < itemCount - 1 && itemPositions[endIndex] < scrollTop + containerHeight) {
        endIndex++;
    }

    // Apply overscan to render items slightly outside the viewport
    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(itemCount - 1, endIndex + overscan);

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
        visibleItems.push({
            index: i,
            style: {
                position: 'absolute',
                top: `${itemPositions[i]}px`,
                width: '100%',
                height: `${getItemHeight(i)}px`,
            } as React.CSSProperties,
        });
    }

    return { totalHeight, visibleItems };
};