/**
 * Triggers a vibration on supported devices.
 * @param pattern - A number or array of numbers describing the vibration pattern.
 *                  e.g., 50 for a 50ms vibration, [100, 50, 100] for vibrate, pause, vibrate.
 */
export const vibrate = (pattern: number | number[] = 10): void => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            // This can happen if the document is not focused, etc.
            // We can safely ignore it.
            // console.warn('Vibration failed:', error);
        }
    }
};
