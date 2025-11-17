import React, { useCallback, useMemo } from 'react';
import Clock from '../Clock';
import TodaySummaryCard from './TodaySummaryCard';
import TeamClocksView from './TeamClocksView';
import { useTheme } from '../../contexts/ThemeContext';
import { useClockInteraction } from '../../hooks/useInteractiveClock';
import { useClockTimer } from '../../hooks/useClockTimer';
import { Routine, Member, Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import ManagementActions from './ManagementActions';
import { useModal } from '../../contexts/ModalContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useToast } from '../../contexts/ToastContext';


interface ClockDisplayProps {
    showGlow?: boolean;
    routines: Routine[];
    onItemClick: (routine: Routine) => void;
    allRoutines: Routine[];
    members: Member[];
    teams: Team[];
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({ 
    showGlow = false,
    routines,
    onItemClick,
    allRoutines,
    members,
    teams
}) => {
    const { themeConfig, clockLayout, clockEffects, timezone } = useTheme();
    const { currentUser } = useAuth();
    const { openRoutineModal, openEditMemberModal, confirm } = useModal();
    const { deleteMemberAndRoutines } = useAppData();
    const { addToast } = useToast();

    const { isTimerActive, timeRemaining, duration, startTimer, cancelTimer } = useClockTimer();
    
    const handleClockClick = useCallback(() => {
        if (isTimerActive) {
            cancelTimer();
        }
    }, [isTimerActive, cancelTimer]);

    const { time, isSettingTime, isSettingTimer, timerDraftAngle, clockRef, handleInteractionStart } = useClockInteraction(startTimer, handleClockClick);

    const todaysRoutines = useMemo(() => {
        const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
        const dayOfWeek = today.getDay();
        const dayOfMonth = today.getDate();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayISO = `${year}-${month}-${day}`;

        return routines.filter((routine: Routine) => {
            switch (routine.repetition) {
                case 'Daily': return true;
                case 'Weekly': return routine.weekdays?.includes(dayOfWeek);
                case 'Monthly': return routine.monthDays?.includes(dayOfMonth);
                case 'Annually': return routine.annualDates?.includes(todayISO);
                default: return false;
            }
        });
    }, [routines, timezone]);

    const { formattedHours, formattedMinutes, ampm, seconds } = useMemo(() => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hourCycle: 'h12',
        });
        const parts = formatter.formatToParts(time);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

        return {
            formattedHours: getPart('hour'),
            formattedMinutes: getPart('minute'),
            ampm: getPart('dayPeriod'),
            seconds: parseInt(getPart('second'), 10),
        };
    }, [time, timezone]);

    const formattedDate = useMemo(() => time.toLocaleDateString(undefined, {
        timeZone: timezone,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }), [time, timezone]);
    
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
    
    const handleEditMember = useCallback((member: Member) => {
        openEditMemberModal(member);
    }, [openEditMemberModal]);

    const handleDeleteMember = useCallback((member: Member) => {
        confirm({
            title: `Delete ${member.name}?`,
            message: `Are you sure you want to delete this member and all of their associated items? This action cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: () => {
                deleteMemberAndRoutines(member.id);
                addToast(`${member.name} has been deleted.`, 'success');
            },
        });
    }, [confirm, deleteMemberAndRoutines, addToast]);

    const handleAddItemForMember = useCallback((memberId: number) => {
        openRoutineModal(memberId);
    }, [openRoutineModal]);

    const canManage = currentUser?.role === 'Admin' || currentUser?.role === 'Owner';
    const canViewTeamClocks = canManage;
    const isFocusMode = isTimerActive || isSettingTimer;

    return (
        <div className="flex flex-col items-center">
            {showGlow && <div className="clock-glow-effect" />}
            
            <div className="relative flex flex-col items-center">
                <div className={`transition-all duration-500 ease-in-out ${isFocusMode ? 'scale-75' : 'scale-100'}`}>
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
                        isDimmed={isFocusMode}
                    />
                </div>
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${isFocusMode ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-7xl font-mono text-white tracking-wider" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {isTimerActive ? formatTimer(timeRemaining) : formatTimer(getDraftDuration())}
                    </p>
                    <button onClick={cancelTimer} aria-label="Cancel timer" className={`mt-4 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/20 pointer-events-auto`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="relative w-full max-w-sm">
                <div className={`transition-all duration-500 ease-in-out ${isFocusMode ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                    <div className="flex flex-col items-center mt-4">
                        <div
                            className={`px-6 py-2 md:px-8 md:py-3 rounded-full ${themeConfig.engravedBg} transition-transform duration-300 ease-in-out transform ${isSettingTime ? 'scale-105' : 'scale-100'}`}
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
                        <p className={`mt-4 text-xl md:text-2xl font-sans ${themeConfig.subtextColor}`}>
                            {formattedDate}
                        </p>
                        <TodaySummaryCard
                            todaysRoutines={todaysRoutines}
                            onItemClick={onItemClick}
                        />
                        {canManage && <ManagementActions />}
                    </div>
                </div>
            </div>

            {canViewTeamClocks && (
                <TeamClocksView
                    members={members}
                    teams={teams}
                    allRoutines={allRoutines}
                    time={time}
                    onEditMember={handleEditMember}
                    onDeleteMember={handleDeleteMember}
                    onAddItemForMember={handleAddItemForMember}
                />
            )}
        </div>
    );
};

export default ClockDisplay;