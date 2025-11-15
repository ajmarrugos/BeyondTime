import React, { useMemo } from 'react';
import Clock from '../Clock';
import { useTheme } from '../../contexts/ThemeContext';
import { useClockInteraction } from '../../hooks/useInteractiveClock';
import { useClockTimer } from '../../hooks/useClockTimer';
import { Routine } from '../../types';

interface ClockViewProps {
    showGlow?: boolean;
    routines: Routine[];
    completedTasks: Record<number, number[]>;
    onNavigateToRoutines: () => void;
}

const ClockView: React.FC<ClockViewProps> = ({ 
    showGlow = false,
    routines,
    completedTasks,
    onNavigateToRoutines,
}) => {
    const { themeConfig, clockLayout, clockEffects } = useTheme();

    const { isTimerActive, timeRemaining, duration, startTimer, cancelTimer } = useClockTimer();
    const { time, isSettingTime, isSettingTimer, timerDraftAngle, clockRef, handleInteractionStart } = useClockInteraction(startTimer);

    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Saturday - 6
    const dayOfMonth = today.getDate(); // 1-31
    
    // Create a local timezone YYYY-MM-DD string to match stored annual dates
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayISO = `${year}-${month}-${day}`;

    const todaysRoutines = routines.filter((routine: Routine) => {
        switch (routine.repetition) {
            case 'Daily':
                return true;
            case 'Weekly':
                return routine.weekdays?.includes(dayOfWeek);
            case 'Monthly':
                return routine.monthDays?.includes(dayOfMonth);
            case 'Annually':
                return routine.annualDates?.includes(todayISO);
            default:
                return false;
        }
    });

    const summary = useMemo(() => {
        if (todaysRoutines.length === 0) {
            return null;
        }

        let totalTasks = 0;
        let completedCount = 0;

        todaysRoutines.forEach(routine => {
            totalTasks += routine.tasks.length;
            const completedForRoutine = completedTasks[routine.id] || [];
            completedCount += completedForRoutine.length;
        });

        return {
            totalRoutines: todaysRoutines.length,
            completedTasks: completedCount,
            totalTasks: totalTasks,
        };
    }, [todaysRoutines, completedTasks]);

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
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const getDraftDuration = () => {
        const startAngle = (time.getSeconds() / 60) * 360;
        let angleDiff = timerDraftAngle - startAngle;
        if (angleDiff < 0) angleDiff += 360;
        return Math.round((angleDiff / 360) * 60);
    };
    
    const routineSummaryComponent = summary && (
        <button 
            onClick={onNavigateToRoutines}
            className={`mt-4 px-6 py-3 rounded-2xl w-full max-w-sm ${themeConfig.engravedBg} hover:bg-white/10 transition-colors duration-200 text-left`}
            aria-label={`View today's ${summary.totalRoutines} routines`}
            data-no-swipe="true"
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className={`font-semibold ${themeConfig.textColor}`}>{summary.totalRoutines} {summary.totalRoutines > 1 ? 'Routines' : 'Routine'} Today</p>
                    <p className={`text-sm ${themeConfig.subtextColor}`}>
                        {summary.completedTasks} of {summary.totalTasks} tasks completed
                    </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${themeConfig.subtextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );

    return (
        <div className="w-full h-full flex flex-col items-center justify-center z-10 relative overflow-hidden">
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
                            {routineSummaryComponent}
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
                    {routineSummaryComponent}
                </>
            )}
        </div>
    );
};

export default ClockView;