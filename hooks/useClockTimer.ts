import { useState, useEffect, useCallback, useRef } from 'react';
import { vibrate } from '../utils/haptics';

export const useClockTimer = () => {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [duration, setDuration] = useState(0); // in seconds
    const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
    const endTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const clearTimerInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (isTimerActive && endTimeRef.current) {
            intervalRef.current = window.setInterval(() => {
                const now = Date.now();
                const remaining = Math.round((endTimeRef.current! - now) / 1000);

                if (remaining <= 0) {
                    setTimeRemaining(0);
                    setIsTimerActive(false);
                    // Optional: play a sound or show a notification
                } else {
                    setTimeRemaining(remaining);
                }
            }, 500);
        } else {
            clearTimerInterval();
        }
        return clearTimerInterval;
    }, [isTimerActive]);

    const startTimer = useCallback((durationInSeconds: number) => {
        if (durationInSeconds <= 0) return;
        
        clearTimerInterval();
        const newEndTime = Date.now() + durationInSeconds * 1000;
        endTimeRef.current = newEndTime;
        
        setDuration(durationInSeconds);
        setTimeRemaining(durationInSeconds);
        setIsTimerActive(true);
        vibrate([50, 100, 50]);
    }, []);

    const cancelTimer = useCallback(() => {
        clearTimerInterval();
        setIsTimerActive(false);
        setDuration(0);
        setTimeRemaining(0);
        endTimeRef.current = null;
    }, []);

    return {
        isTimerActive,
        duration,
        timeRemaining,
        startTimer,
        cancelTimer,
    };
};
