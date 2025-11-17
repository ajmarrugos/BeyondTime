import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CLOCK_RETURN_ANIMATION_MS } from '../config/constants';
import { vibrate } from '../utils/haptics';

const LONG_PRESS_DURATION_MS = 400;

type InteractionState = 'idle' | 'pressing' | 'settingTime' | 'settingTimer';

/**
 * A hook to manage all user interactions with the main clock face, including:
 * 1. Setting the time via a short drag.
 * 2. Setting a timer via a long-press and drag.
 * 3. Smoothly animating the clock back to the real time after user interaction.
 */
export const useClockInteraction = (
    onTimerSet: (durationInSeconds: number) => void,
    onClockClick: () => void,
) => {
    const [time, setTime] = useState(new Date());
    const [interactionState, setInteractionState] = useState<InteractionState>('idle');
    const [timerDraftAngle, setTimerDraftAngle] = useState(0);

    const clockRef = useRef<HTMLDivElement>(null);
    const longPressTimeoutRef = useRef<number | null>(null);
    // FIX: Initialize useRef with a value to satisfy its signature.
    const animationFrameRef = useRef<number | undefined>(undefined);
    const lastUserSetTimeRef = useRef<number | null>(null);
    const setTimeFromCoordsRef = useRef<(x: number, y: number) => void>(() => {});


    // --- Timekeeping and Animation Logic ---

    useEffect(() => {
        let animationFrameId: number;
        
        const tick = () => {
            if (!document.hidden) {
                setTime(new Date());
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        if (interactionState === 'settingTime' || interactionState === 'settingTimer') {
             // Stop ticking if the user is interacting
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        } else if (lastUserSetTimeRef.current !== null) {
            // Animate back to real time after settingTime
            const userSetTime = lastUserSetTimeRef.current;
            lastUserSetTimeRef.current = null; 

            const animationStartTime = performance.now();
            const duration = CLOCK_RETURN_ANIMATION_MS;

            const animateBack = (currentTimestamp: number) => {
                const realTimeNow = new Date().getTime();
                const elapsedTime = currentTimestamp - animationStartTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
                const interpolatedTime = userSetTime + (realTimeNow - userSetTime) * easedProgress;
                
                setTime(new Date(interpolatedTime));

                if (progress < 1) {
                    animationFrameRef.current = requestAnimationFrame(animateBack);
                } else {
                    animationFrameRef.current = undefined;
                    animationFrameId = requestAnimationFrame(tick);
                }
            };
            animationFrameRef.current = requestAnimationFrame(animateBack);
        } else {
            // Default: tick with real time
            animationFrameId = requestAnimationFrame(tick);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

    }, [interactionState]);


    // --- Gesture Handling Logic ---

    const calculateAngleFromCoords = useCallback((clientX: number, clientY: number): number => {
        if (!clockRef.current) return 0;
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
        let angleDeg = angleRad * (180 / Math.PI) + 90; // Adjust for CSS transform rotation
        if (angleDeg < 0) angleDeg += 360;
        return angleDeg;
    }, []);

    useEffect(() => {
        setTimeFromCoordsRef.current = (clientX, clientY) => {
            const angleDeg = calculateAngleFromCoords(clientX, clientY);
            const totalMinutesIn12Hours = (angleDeg / 360) * (12 * 60);
            const newHourOnClock = Math.floor(totalMinutesIn12Hours / 60);
            const newMinute = Math.floor(totalMinutesIn12Hours % 60);
    
            setTime(currentTime => {
                const newTime = new Date(currentTime);
                const wasPM = newTime.getHours() >= 12;
                let newHour24 = (newHourOnClock % 12) + (wasPM ? 12 : 0);
                if (wasPM && newHourOnClock === 12) newHour24 = 12; // Handle 12 PM
                if (!wasPM && newHourOnClock === 12) newHour24 = 0;  // Handle 12 AM
                
                newTime.setHours(newHour24, newMinute, newTime.getSeconds());
                return newTime;
            });
        };
    }, [setTime, calculateAngleFromCoords]);
    
    const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        
        vibrate(20);
        setInteractionState('pressing');

        longPressTimeoutRef.current = window.setTimeout(() => {
            if (longPressTimeoutRef.current) {
                setInteractionState('settingTimer');
                const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
                const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
                setTimerDraftAngle(calculateAngleFromCoords(clientX, clientY));
            }
        }, LONG_PRESS_DURATION_MS);

    }, [calculateAngleFromCoords]);
    
    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (interactionState === 'idle') return;

        // If user moves before long press timeout, switch to setting time
        if (interactionState === 'pressing') {
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
                longPressTimeoutRef.current = null;
            }
            setInteractionState('settingTime');
        }

        if (e.type === 'touchmove') e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (interactionState === 'settingTime') {
            setTimeFromCoordsRef.current(clientX, clientY);
        } else if (interactionState === 'settingTimer') {
            setTimerDraftAngle(calculateAngleFromCoords(clientX, clientY));
        }
    }, [interactionState, calculateAngleFromCoords]);
    
    const handleEnd = useCallback(() => {
        if (interactionState === 'idle') return;

        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }

        if (interactionState === 'pressing') {
            onClockClick();
        } else if (interactionState === 'settingTimer') {
            // A full 360 degrees is 60 minutes.
            const durationInMinutes = (timerDraftAngle / 360) * 60;
            // Round to the nearest minute for clean timer setting
            const roundedMinutes = Math.round(durationInMinutes);
            const durationSeconds = roundedMinutes * 60;

            if (durationSeconds > 0) {
                onTimerSet(durationSeconds);
            }
        } else if (interactionState === 'settingTime') {
             setTime(currentTime => {
                lastUserSetTimeRef.current = currentTime.getTime();
                return currentTime;
            });
        }

        setInteractionState('idle');
    }, [interactionState, onClockClick, timerDraftAngle, onTimerSet]);


    useEffect(() => {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [handleMove, handleEnd]);

    return {
        time,
        isSettingTime: interactionState === 'settingTime',
        isSettingTimer: interactionState === 'settingTimer',
        timerDraftAngle,
        clockRef,
        handleInteractionStart
    };
};
