import React, { useCallback } from 'react';
import Clock from '../Clock';
import TodaySummaryCard from './TodaySummaryCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useClockInteraction } from '../../hooks/useInteractiveClock';
import { useClockTimer } from '../../hooks/useClockTimer';
import { Routine } from '../../types';

interface ClockDisplayProps {
    showGlow?: boolean;
    routines: Routine[];
    completedTasks: Record<number, number[]>;
    onNavigateToRoutines: () => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({ 
    showGlow = false,
    routines,
    completedTasks,
    onNavigateToRoutines,
}) => {
    const { themeConfig, clockLayout, clockEffects } = useTheme();

    const { isTimerActive, timeRemaining, duration, startTimer, cancelTimer } = useClockTimer();
    
    const handleClockClick = useCallback(() => {
        if (isTimerActive) {
            cancelTimer();
        }
    }, [isTimerActive, cancelTimer]);

    const { time, isSettingTime, isSettingTimer, timerDraftAngle, clockRef, handleInteractionStart } = useClockInteraction(startTimer, handleClockClick);

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayISO = `${year}-${month}-${day}`;

    const todaysRoutines = routines.filter((routine: Routine) => {
        switch (routine.repetition) {
            case 'Daily': return true;
            case 'Weekly': return routine.weekdays?.includes(dayOfWeek);
            case 'Monthly': return routine.monthDays?.includes(dayOfMonth);
            case 'Annually': return routine.annualDates?.includes(todayISO);
            default: return false;
        }
    });

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    const formattedHours = String(hours12).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedDate = time.toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric',
    });
    
    const formatTimer = (seconds: number) => {
        const totalSeconds = Math.round(seconds);
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const getDraftDuration = useCallback(() => {
        const durationInMinutes = (timerDraftAngle / 360) * 60;
        const roundedMinutes = Math.round(durationInMinutes);
        return roundedMinutes * 60;
    }, [timerDraftAngle]);

    return (
        <>
            {showGlow && <div className="clock-glow-effect" />}
            {clockLayout !== 'digital' ? (
                <>
                    <Clock 
                        time={time} 
                        isSettingTime={isSettingTime}
                        clockRef={clockRef}
                        onInteractionStart={handleInteractionStart}
                        routines={todaysRoutines}
                        layout={clockLayout}
                        effects={clockEffects}
                        isTimerActive={isTimerActive}
                        isSettingTimer={isSettingTimer}
                        timeRemaining={timeRemaining}
                        timerDuration={duration}
                        timerDraftAngle={timerDraftAngle}
                    />
                    <div
                        className={`mt-8 px-6 py-2 md:px-8 md:py-3 rounded-full ${themeConfig.engravedBg} transition-transform duration-300 ease-in-out transform ${isSettingTime ? 'scale-105' : 'scale-100'}`}
                        data-no-swipe="true"
                    >
                        <div className={`flex items-baseline transition-colors duration-300 ${isSettingTime ? 'text-accent' : themeConfig.textColor}`}>
                            <p className="text-4xl md:text-5xl font-light tracking-wider">
                                <span>{formattedHours}</span>
                                <span className={`transition-opacity duration-500 ${seconds % 2 === 0 ? 'opacity-100' : 'opacity-50'}`}>{':'}</span>
                                <span>{formattedMinutes}</span>
                            </p>
                            <span className={`ml-3 text-lg md:text-xl font-medium transition-colors duration-300 ${isSettingTime ? 'text-accent opacity-70' : themeConfig.subtextColor}`}>{ampm}</span>
                        </div>
                    </div>
                    {(isTimerActive || isSettingTimer) ? (
                        <div
                            className={`mt-4 px-4 py-2 rounded-full ${themeConfig.engravedBg} flex items-center space-x-4 transition-all duration-300`}
                             data-no-swipe="true"
                        >
                            <p className="text-xl font-mono text-accent tracking-wider">
                                {isTimerActive ? formatTimer(timeRemaining) : formatTimer(getDraftDuration())}
                            </p>
                            <button onClick={cancelTimer} aria-label="Cancel timer" className={`${themeConfig.subtextColor} hover:text-white transition-colors p-1 rounded-full`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className={`mt-4 text-xl md:text-2xl font-sans ${themeConfig.subtextColor}`}>
                                {formattedDate}
                            </p>
                            <TodaySummaryCard
                                todaysRoutines={todaysRoutines}
                                completedTasks={completedTasks}
                                onNavigateToRoutines={onNavigateToRoutines}
                            />
                        </>
                    )}
                </>
            ) : (
                <>
                    <div
                        className={`px-6 py-4 md:px-8 md:py-6 rounded-full ${themeConfig.engravedBg}`}
                        data-no-swipe="true"
                    >
                        <div className={`flex items-baseline ${themeConfig.textColor}`}>
                            <p className="text-7xl md:text-9xl font-light tracking-wider">
                                <span>{formattedHours}</span>
                                <span className={`transition-opacity duration-500 ${seconds % 2 === 0 ? 'opacity-100' : 'opacity-50'}`}>{':'}</span>
                                <span>{formattedMinutes}</span>
                            </p>
                            <span className={`ml-4 text-3xl md:text-4xl font-medium ${themeConfig.subtextColor}`}>{ampm}</span>
                        </div>
                    </div>
                     <p className={`mt-6 text-2xl md:text-4xl font-sans ${themeConfig.subtextColor}`}>
                        {formattedDate}
                    </p>
                    <TodaySummaryCard
                        todaysRoutines={todaysRoutines}
                        completedTasks={completedTasks}
                        onNavigateToRoutines={onNavigateToRoutines}
                    />
                </>
            )}
        </>
    );
};

export default ClockDisplay;