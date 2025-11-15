import { useState, useEffect } from 'react';

/**
 * A custom hook that returns the current time, updated every second.
 * This is useful for components that need to react to time changes,
 * like checking for a "Live" status.
 */
export const useCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Set up an interval to update the time every second
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Clean up the interval when the component unmounts
        return () => {
            clearInterval(timerId);
        };
    }, []); // Empty dependency array ensures this effect runs only once

    return currentTime;
};