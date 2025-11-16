import { useRef, useEffect } from 'react';

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

export const useFocusTrap = (isOpen: boolean) => {
    const containerRef = useRef<HTMLElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            lastFocusedElementRef.current = document.activeElement as HTMLElement;

            const focusableElements = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
            if (focusableElements && focusableElements.length > 0) {
                // Delay focus slightly to ensure the element is fully interactive after transitions
                const timer = setTimeout(() => {
                    focusableElements[0].focus();
                }, 100);
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key !== 'Tab' || !containerRef.current) return;

                const focusable = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
                // FIX: Add a guard to ensure focusable elements exist before trying to access them.
                if (focusable.length === 0) {
                    return;
                }
                const firstElement = focusable[0];
                const lastElement = focusable[focusable.length - 1];

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        // FIX: Cast to HTMLElement to ensure focus method is available.
                        (lastElement as HTMLElement).focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        // FIX: Cast to HTMLElement to ensure focus method is available.
                        (firstElement as HTMLElement).focus();
                        e.preventDefault();
                    }
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                lastFocusedElementRef.current?.focus();
            };
        }
    }, [isOpen]);

    return containerRef;
};