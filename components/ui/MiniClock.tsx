import React, { useMemo } from 'react';
import { Routine, Member } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import Flag from './Flag';
import { timezoneToCountry } from '../../utils/timezoneToCountry';

// --- SVG Arc Helper Functions ---
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
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

const handBaseStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    transformOrigin: 'bottom center',
};

// --- Component ---
interface MiniClockProps {
    member: Member;
    routines: Routine[];
    time: Date;
    onEdit: () => void;
    onDelete: () => void;
    onAdd: () => void;
}

const MiniClock: React.FC<MiniClockProps> = ({ member, routines, time, onEdit, onDelete, onAdd }) => {
    const { themeConfig, timezone: currentUserTimezone } = useTheme();
    const memberTimezone = member.timezone || currentUserTimezone; // Fallback to current user's timezone

    const todaysRoutines = useMemo(() => {
        const today = new Date(new Date().toLocaleString('en-US', { timeZone: memberTimezone }));
        const dayOfWeek = today.getDay();
        const dayOfMonth = today.getDate();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayISO = `${year}-${month}-${day}`;

        return routines.filter((routine: Routine) => {
            if (routine.tags.includes('Task') || routine.tags.includes('Payment')) return false;
            switch (routine.repetition) {
                case 'Daily': return true;
                case 'Weekly': return routine.weekdays?.includes(dayOfWeek);
                case 'Monthly': return routine.monthDays?.includes(dayOfMonth);
                case 'Annually': return routine.annualDates?.includes(todayISO);
                default: return false;
            }
        });
    }, [routines, memberTimezone]);

    const layeredRoutines = useMemo(() => {
        if (!todaysRoutines.length) return [];

        const routinesWithMinutes = todaysRoutines.map(r => ({
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
                if (lastEnd < lastRoutineInTrack.startMinutes) lastEnd += 1440;
                let currentStart = routine.startMinutes;
                if (currentStart < lastRoutineInTrack.startMinutes) currentStart += 1440;
                if (currentStart >= lastEnd) {
                    track.push(routine);
                    placed = true;
                    break;
                }
            }
            if (!placed) tracks.push([routine]);
        });
        return tracks;
    }, [todaysRoutines]);
    
    const { hourRotation, minuteRotation, timezoneAbbreviation, countryCode } = useMemo(() => {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: memberTimezone,
                hour: 'numeric',
                minute: 'numeric',
                hour12: false,
                timeZoneName: 'short',
            });
            const parts = formatter.formatToParts(time);
            const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
            
            const h = parseInt(getPart('hour'), 10);
            const m = parseInt(getPart('minute'), 10);
            const tzAbbr = getPart('timeZoneName');
            
            const hours = h + m / 60;
            const hourRot = (hours % 12) * 30;
            const minuteRot = m * 6;

            const code = timezoneToCountry(memberTimezone);

            return { hourRotation: hourRot, minuteRotation: minuteRot, timezoneAbbreviation: tzAbbr, countryCode: code };
        } catch (e) {
            console.error(`Invalid timezone for member ${member.name}: ${memberTimezone}`);
            return { hourRotation: 0, minuteRotation: 0, timezoneAbbreviation: '???', countryCode: null };
        }
    }, [time, memberTimezone, member.name]);

    const getHandStyle = (rotation: number): React.CSSProperties => ({
        transform: `translateX(-50%) rotate(${rotation}deg)`,
    });

    return (
        <div className="flex flex-col items-center space-y-1 group relative">
            <div className="relative w-20 h-20">
                <div className={`absolute inset-0 rounded-full ${themeConfig.engravedBg} shadow-inner`} />
                <svg viewBox="-50 -50 100 100" className="absolute w-full h-full pointer-events-none">
                    {layeredRoutines.map((track, trackIndex) => {
                        const radius = 40 - (trackIndex * 9);
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
                </svg>

                {/* Hands */}
                <div style={{ ...handBaseStyle, ...getHandStyle(hourRotation), height: '28%', width: '3px' }} className={`rounded-full pointer-events-none ${themeConfig.textColor.replace('text-', 'bg-')} z-20`} />
                <div style={{ ...handBaseStyle, ...getHandStyle(minuteRotation), height: '40%', width: '2px' }} className={`rounded-full pointer-events-none ${themeConfig.textColor.replace('text-', 'bg-')} z-20`} />
                <div className={`absolute w-1.5 h-1.5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${themeConfig.textColor.replace('text-', 'bg-')} z-40 pointer-events-none`}></div>
                
                {/* Management Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-1">
                    <button onClick={onAdd} className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors" aria-label={`Add item for ${member.name}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                    <button onClick={onEdit} className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors" aria-label={`Edit ${member.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                    </button>
                    <button onClick={onDelete} className="p-2 rounded-full bg-black/50 text-white hover:bg-red-500/50 transition-colors" aria-label={`Delete ${member.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            <p className={`text-xs font-medium truncate w-20 text-center ${themeConfig.textColor}`}>{member.name}</p>
            <p className={`text-[10px] -mt-1 font-mono ${themeConfig.subtextColor} opacity-70 flex items-center justify-center space-x-1`}>
                {countryCode && <Flag countryCode={countryCode} className="w-3 h-3" />}
                <span>{timezoneAbbreviation}</span>
            </p>
        </div>
    );
};

export default MiniClock;