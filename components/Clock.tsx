

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTheme, ClockLayout, ClockEffects } from '../contexts/ThemeContext';
import { Routine } from '../types';
import { useDevice } from '../contexts/DeviceContext';
import { useDeviceMotion } from '../contexts/DeviceMotionContext';

interface ClockProps {
    time: Date;
    isSettingTime: boolean;
    clockRef: React.RefObject<HTMLDivElement>;
    onInteractionStart: (e: React.MouseEvent | React.TouchEvent) => void;
    routines?: Routine[];
    layout: ClockLayout;
    effects: ClockEffects;
    isTimerActive: boolean;
    isSettingTimer: boolean;
    timeRemaining: number;
    timerDuration: number;
    timerDraftAngle: number;
}

const handBaseStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    transformOrigin: 'bottom center',
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
};


// --- SVG Arc Helper Functions ---

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
    // Prevent drawing a full circle, which SVG doesn't handle well with this method
    if (endAngle - startAngle >= 360) {
        endAngle = startAngle + 359.99;
    }

    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" ");
    return d;
};

const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};


const Clock: React.FC<ClockProps> = ({ 
    time, 
    isSettingTime, 
    clockRef, 
    onInteractionStart, 
    routines = [], 
    layout, 
    effects,
    isTimerActive,
    isSettingTimer,
    timeRemaining,
    timerDuration,
    timerDraftAngle
}) => {
    const { themeConfig, accentColor } = useTheme();
    const { isDesktop } = useDevice();
    const { tilt } = useDeviceMotion();

    const [styleProps, setStyleProps] = useState({
        transform: '',
        glintTransform: '',
        glintOpacity: 0,
    });
    
    // Layering logic for routine arcs
    const layeredRoutines = useMemo(() => {
        if (!routines.length) return [];

        const routinesWithMinutes = routines.map(r => ({
            ...r,
            startMinutes: timeToMinutes(r.startTime),
            endMinutes: timeToMinutes(r.endTime),
        })).sort((a, b) => a.startMinutes - b.startMinutes);

        const tracks: (typeof routinesWithMinutes)[] = [];

        routinesWithMinutes.forEach(routine => {
            let placed = false;
            for (const track of tracks) {
                const lastRoutineInTrack = track[track.length - 1];
                let lastEnd = lastRoutineInTrack.endMinutes;
                // Handle overnight routines for comparison
                if(lastEnd < lastRoutineInTrack.startMinutes) lastEnd += 1440;
                let currentStart = routine.startMinutes;
                if(currentStart < lastRoutineInTrack.startMinutes) currentStart += 1440;

                if (currentStart >= lastEnd) {
                    track.push(routine);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                tracks.push([routine]); // Create a new track
            }
        });
        return tracks;
    }, [routines]);


    useEffect(() => {
        const clockElement = clockRef.current;
        if (!clockElement) return;

        // If effects are off, reset styles and do nothing.
        if (!effects.parallax && !effects.glint) {
             setStyleProps({
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                glintTransform: '',
                glintOpacity: 0,
            });
            return;
        }

        // --- Desktop: Mouse-based effects ---
        if (isDesktop) {
            const handleMouseMove = (e: MouseEvent) => {
                const rect = clockElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                
                const newStyleProps: Partial<typeof styleProps> = {};
                
                if (effects.parallax) {
                    const rotateX = (-mouseY / rect.height) * 15;
                    const rotateY = (mouseX / rect.width) * 15;
                    newStyleProps.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }
                
                if (effects.glint) {
                    const angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
                    const distance = Math.sqrt(mouseX**2 + mouseY**2);
                    const maxDistance = Math.sqrt((rect.width/2)**2 + (rect.height/2)**2);
                    const opacity = Math.min(distance / maxDistance, 0.4);
                    newStyleProps.glintTransform = `rotate(${angle}deg)`;
                    newStyleProps.glintOpacity = opacity;
                }

                setStyleProps(prev => ({ ...prev, ...newStyleProps }));
            };

            const handleMouseLeave = () => {
                const newStyleProps: Partial<typeof styleProps> = {};
                if(effects.parallax) newStyleProps.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                if(effects.glint) newStyleProps.glintOpacity = 0;
                setStyleProps(prev => ({...prev, ...newStyleProps}));
            };

            clockElement.addEventListener('mousemove', handleMouseMove);
            clockElement.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                clockElement.removeEventListener('mousemove', handleMouseMove);
                clockElement.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
        
        // --- Mobile: Device-motion-based effects ---
        else if (tilt) {
             const newStyleProps: Partial<typeof styleProps> = {};
            
            const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));
            const beta = clamp(tilt.beta, -9.8, 9.8);
            const gamma = clamp(tilt.gamma, -9.8, 9.8);
             
            if (effects.parallax) {
                const rotateX = beta * 1.5;
                const rotateY = -gamma * 1.5;
                newStyleProps.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }

            if (effects.glint) {
                const glintX = -gamma;
                const glintY = beta;
                const angle = Math.atan2(glintY, glintX) * (180 / Math.PI);
                const distance = Math.sqrt(glintX**2 + glintY**2);
                const maxDistance = 9.8;
                const opacity = Math.min(distance / maxDistance, 0.4);
                
                newStyleProps.glintTransform = `rotate(${angle}deg)`;
                newStyleProps.glintOpacity = opacity;
            }
            
            setStyleProps(prev => ({ ...prev, ...newStyleProps }));
        }

    }, [clockRef, effects.parallax, effects.glint, isDesktop, tilt]);

    const milliseconds = time.getMilliseconds();
    const seconds = effects.sweepingSecondHand ? (time.getSeconds() + milliseconds / 1000) : time.getSeconds();
    const minutes = effects.sweepingSecondHand ? (time.getMinutes() + seconds / 60) : time.getMinutes();
    const hours = time.getHours() + minutes / 60;

    const hourRotation = (hours % 12) * 30;
    const minuteRotation = minutes * 6;
    const secondRotation = seconds * 6;

    const getHandStyle = (rotation: number): React.CSSProperties => ({
        transform: `translateX(-50%) rotate(${rotation}deg)`,
    });
    
    const clockContainerStyle: React.CSSProperties = {
        transform: styleProps.transform,
        transition: 'transform 0.1s linear',
    };
    
    const glintStyle: React.CSSProperties = {
        transform: styleProps.glintTransform,
        opacity: styleProps.glintOpacity,
        transition: 'opacity 0.5s ease-out',
    };

    const timerArcPath = useMemo(() => {
        if (!isTimerActive && !isSettingTimer) return null;

        const startAngle = (time.getSeconds() / 60) * 360;
        
        if (isSettingTimer) {
             let angleDiff = timerDraftAngle - startAngle;
             if (angleDiff < 0) angleDiff += 360;
             const effectiveEndAngle = startAngle + angleDiff;
             return describeArc(0, 0, 45, startAngle, effectiveEndAngle);
        }
        
        if (isTimerActive) {
            const currentSecondAngle = (time.getSeconds() + time.getMilliseconds() / 1000) * 6;
            const durationAngle = (timeRemaining / 60) * 360;
            const timerEndAngle = currentSecondAngle + durationAngle;
            return describeArc(0, 0, 45, currentSecondAngle, timerEndAngle);
        }

        return null;
    }, [isTimerActive, isSettingTimer, time, timeRemaining, timerDraftAngle]);

    const timerHandlePosition = useMemo((): React.CSSProperties | null => {
        if (!isSettingTimer) return null;
        const radius = (clockRef.current?.offsetWidth ?? 0) / 2;
        return {
            transform: `rotate(${timerDraftAngle}deg) translateY(-${radius * 0.9}px)`,
        };
    }, [isSettingTimer, timerDraftAngle, clockRef.current]);

    return (
        <div 
            ref={clockRef}
            className={`relative aspect-square w-[60vh] max-w-[21rem] md:max-w-[26rem] rounded-full flex items-center justify-center cursor-pointer touch-none select-none overflow-hidden`}
            style={clockContainerStyle}
            onMouseDown={onInteractionStart}
            onTouchStart={onInteractionStart}
            data-no-swipe="true"
        >
            <div className={`absolute inset-0 rounded-full ${themeConfig.engravedBg} shadow-inner`}/>

            {/* Glint effect */}
            {effects.glint && (
                <div 
                    className="absolute w-[150%] h-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    style={glintStyle}
                />
            )}

            {/* Markers */}
            {(layout === 'luxury' || layout === 'minimalist') && Array.from({ length: 12 }).map((_, i) => {
                const isMajor = i % 3 === 0;
                if (layout === 'minimalist' && !isMajor) return null;

                return (
                    <div key={i} className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                        <div className={`absolute top-3 left-1/2 -translate-x-1/2 rounded-full ${themeConfig.textColor.replace('text-', 'bg-')} ${isMajor ? 'w-1 h-6 opacity-80' : 'w-0.5 h-4 opacity-50'}`} />
                    </div>
                );
            })}

            {layout === 'pro' && Array.from({ length: 12 }).map((_, i) => {
                const width = 10;
                const height = 15;
                return (
                     <div key={`pro-${i}`} className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                        <svg 
                            width={width} 
                            height={height} 
                            viewBox="0 0 10 15" 
                            className="absolute top-3 left-1/2 -translate-x-1/2"
                            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                        >
                            <path 
                                d="M0 0L10 0L5 15Z" 
                                className={`${themeConfig.textColor.replace('text-','fill-')}`}
                                opacity={0.8}
                            />
                        </svg>
                    </div>
                )
            })}

            {layout === 'luxury' && Array.from({ length: 60 }).map((_, i) => (i % 5 !== 0) && (
                <div key={`min-${i}`} className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${i * 6}deg)` }}>
                    <div className={`absolute top-3 left-1/2 -translate-x-1/2 w-px h-2 ${themeConfig.textColor.replace('text-','bg-')} opacity-20`} />
                </div>
            ))}

            {/* Arcs SVG Container */}
            <svg viewBox="-50 -50 100 100" className="absolute w-full h-full pointer-events-none z-10">
                {/* Routine Arcs */}
                {layeredRoutines.map((track, trackIndex) => {
                    const radius = 36 - (trackIndex * 9);
                    return track.map(routine => {
                        let totalEndMinutes = routine.endMinutes;
                        if (totalEndMinutes <= routine.startMinutes) totalEndMinutes += 1440; 
                        
                        const startAngle = (routine.startMinutes / 1440) * 360;
                        const endAngle = (totalEndMinutes / 1440) * 360;
                        const pathData = describeArc(0, 0, radius, startAngle, endAngle);
                        return (
                            <path
                                key={`${routine.id}-${trackIndex}`}
                                d={pathData}
                                fill="none"
                                stroke={routine.color}
                                strokeWidth={8}
                                strokeLinecap="round"
                                opacity={0.8}
                            >
                                <title>{`${routine.name}: ${routine.startTime} - ${routine.endTime}`}</title>
                            </path>
                        );
                    });
                })}
                {/* Timer Arc */}
                {timerArcPath && (
                     <path
                        d={timerArcPath}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={5}
                        strokeLinecap="round"
                        opacity={0.9}
                        style={{ filter: `drop-shadow(0 0 3px ${accentColor})` }}
                    />
                )}
            </svg>
            
            {/* Hands */}
            <div style={{ ...handBaseStyle, ...getHandStyle(hourRotation), height: '28%', width: '8px' }} className={`rounded-full pointer-events-none ${themeConfig.textColor.replace('text-', 'bg-')} z-20`} />
            <div style={{ ...handBaseStyle, ...getHandStyle(minuteRotation), height: '40%', width: '6px' }} className={`rounded-full pointer-events-none ${themeConfig.textColor.replace('text-', 'bg-')} z-20`} />
            <div style={{ ...handBaseStyle, ...getHandStyle(secondRotation), height: '42%', width: '2px', backgroundColor: accentColor }} className={`rounded-full pointer-events-none z-30`} />
            
            {/* Center Pin */}
            <div className="absolute w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-600 z-40 pointer-events-none shadow-md"></div>
             <div className={`absolute w-2 h-2 rounded-full ${themeConfig.textColor.replace('text-', 'bg-')} z-40 pointer-events-none`}></div>
            
             {/* Timer Drag Handle */}
            {isSettingTimer && timerHandlePosition && (
                <div 
                    className="absolute top-1/2 left-1/2 -mt-3 -ml-3 w-6 h-6 rounded-full border-4 shadow-lg z-50 pointer-events-none"
                    style={{ 
                        ...timerHandlePosition,
                        backgroundColor: accentColor,
                        borderColor: themeConfig.type === 'dark' ? '#FFFFFF80' : '#00000080',
                    }}
                />
            )}
        </div>
    );
};

export default Clock;