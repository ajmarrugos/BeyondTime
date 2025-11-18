import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { Routine } from '../types';
import { formatRepetition } from '../utils/formatters';
import { vibrate } from '../utils/haptics';
import { useAppData } from '../contexts/AppDataContext';

interface RoutineCardActions {
    delete: (id: number) => void;
    edit: (id: number) => void;
}

interface RoutineCardProps {
    routine: Routine;
    isPlaceholder: boolean;
    isDeleting: boolean;
    actions: RoutineCardActions;
    onDeleteAnimationEnd: (id: number) => void;
    onInteractionStart: (e: React.MouseEvent | React.TouchEvent) => void;
    completedTaskIds: Set<number>;
    onToggleTask: (taskId: number) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
};

const RoutineCard = React.memo(React.forwardRef<HTMLDivElement, RoutineCardProps>(({ 
    routine, 
    isPlaceholder,
    isDeleting,
    actions,
    onDeleteAnimationEnd,
    onInteractionStart,
    completedTaskIds,
    onToggleTask,
    isExpanded,
    onToggleExpand,
}, ref) => {
    const { themeConfig, timezone } = useTheme();
    const { members } = useAppData();
    const { canEditRoutine, canDeleteRoutine } = usePermissions();
    const currentTime = useCurrentTime();

    const isTaskOrPayment = useMemo(() => routine.tags.includes('Task') || routine.tags.includes('Payment'), [routine.tags]);

    const member = members.find(m => m.id === routine.memberId);

    const isLive = useMemo(() => {
        if (!routine.autoLive || isTaskOrPayment) return false;
        
        const timeInTimezone = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
        const nowInMinutes = timeInTimezone.getHours() * 60 + timeInTimezone.getMinutes();

        const [startHour, startMinute] = routine.startTime.split(':').map(Number);
        const startTimeInMinutes = startHour * 60 + startMinute;

        const [endHour, endMinute] = routine.endTime.split(':').map(Number);
        const endTimeInMinutes = endHour * 60 + endMinute;

        if (endTimeInMinutes <= startTimeInMinutes) { // Overnight
          return nowInMinutes >= startTimeInMinutes || nowInMinutes < endTimeInMinutes;
        }
        
        return nowInMinutes >= startTimeInMinutes && nowInMinutes < endTimeInMinutes;
    }, [currentTime, routine, isTaskOrPayment, timezone]);

    const isCompleted = useMemo(() => {
        if (isTaskOrPayment) {
            return completedTaskIds.has(0);
        }
        if (routine.tasks.length === 0) return false; // Routines with no tasks can't be completed.
        return routine.tasks.every(task => completedTaskIds.has(task.id));
    }, [routine, completedTaskIds, isTaskOrPayment]);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.delete(routine.id);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.edit(routine.id);
    };
    
    const handleAnimationEnd = () => {
        if (isDeleting) onDeleteAnimationEnd(routine.id);
    };

    const handleToggleTask = (taskId: number) => {
        onToggleTask(taskId);
        vibrate();
    };

    const glowStyle: React.CSSProperties = isLive && !isCompleted ? { 
        '--glow-color-rgb': hexToRgb(routine.color),
        animation: 'live-glow 2s ease-in-out infinite'
    } as React.CSSProperties : {};
    
    const classes = `w-full h-full p-4 rounded-3xl relative overflow-hidden flex flex-col ${themeConfig.cardBg} backdrop-blur-xl border transition-all duration-300 ${isDeleting ? 'routine-card-fly-out' : ''} ${isPlaceholder ? 'opacity-30 border-dashed border-white/30' : 'opacity-100 border-white/10'}`;

    return (
        <article ref={ref} onAnimationEnd={handleAnimationEnd} className={classes} style={glowStyle} aria-labelledby={`routine-title-${routine.id}`} data-routine-id={routine.id}>
            <div style={{ backgroundColor: routine.color, opacity: 0.08 }} className="absolute top-[-50%] left-[-20%] w-40 h-40 rounded-full pointer-events-none" />
            <div style={{ backgroundColor: routine.color, opacity: 0.08 }} className="absolute bottom-[-40%] right-[-15%] w-36 h-36 rounded-full pointer-events-none" />
            
            <div className={`relative z-10 transition-opacity duration-300 flex-grow flex flex-col ${isCompleted ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex items-start space-x-3">
                    <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-black/20`}>
                        <svg className="w-6 h-6" style={{ color: routine.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={routine.icon} /></svg>
                    </div>
                    <div className="min-w-0 flex-grow">
                        <div className="flex justify-between items-baseline">
                            <h3 id={`routine-title-${routine.id}`} className={`font-bold text-lg truncate ${themeConfig.textColor}`}>{routine.name}</h3>
                            {isCompleted ? (
                                <div className="flex items-center space-x-1.5 flex-shrink-0 pl-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-xs font-bold tracking-wider uppercase text-green-400">Completed</span>
                                </div>
                            ) : isLive && (
                                <div className="flex items-center space-x-1.5 flex-shrink-0 pl-2">
                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                                    <span className="text-xs font-bold tracking-wider uppercase text-red-400">Live</span>
                                </div>
                            )}
                        </div>
                        <p className={`text-sm truncate ${themeConfig.subtextColor}`}>{member?.name || 'Unknown Member'}</p>
                        {routine.tags.length > 0 && (
                            <div className="flex flex-wrap gap-x-2 gap-y-1 items-center mt-2">
                                {routine.tags.map(tag => (<div key={tag} className={`py-0.5 px-2.5 rounded-full text-xs font-medium ${themeConfig.subtextColor} border border-white/10 bg-black/10`}>{tag}</div>))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[60rem] opacity-100' : 'max-h-0'}`}>
                     <div className="border-t border-white/10 pt-4 mt-3 space-y-4">
                        <div>
                            <h4 className={`text-sm font-semibold mb-2 ${themeConfig.textColor}`}>Description</h4>
                            <p className={`text-sm ${themeConfig.subtextColor} pr-2`}>{routine.description || "No description provided."}</p>
                        </div>
                        
                        {isTaskOrPayment ? (
                            <div className="space-y-4">
                                {routine.tags.includes('Payment') && routine.budget && (
                                    <div>
                                        <h4 className={`text-xs font-semibold uppercase tracking-wider mb-1 ${themeConfig.subtextColor}`}>Amount Due</h4>
                                        <p className={`font-mono text-2xl font-bold ${themeConfig.textColor}`}>${routine.budget.toFixed(2)}</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleToggleTask(0)}
                                    className={`w-full py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${isCompleted ? `bg-white/10 ${themeConfig.textColor}` : `bg-accent text-white`}`}
                                >
                                    {isCompleted ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            <span>Mark as Incomplete</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            <span>Mark as Complete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h4 className={`text-sm font-semibold mb-2 ${themeConfig.textColor}`}>Tasks</h4>
                                <ul className={`space-y-2 text-sm ${themeConfig.subtextColor} max-h-40 overflow-y-auto pr-2 -mr-2`}>
                                    {routine.tasks.length > 0 ? (
                                        routine.tasks.map(task => {
                                            const isTaskCompleted = completedTaskIds.has(task.id);
                                            return (
                                                <li key={task.id} className="flex items-center space-x-3">
                                                    <button onClick={() => handleToggleTask(task.id)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${isTaskCompleted ? 'border-transparent' : 'border-white/30'}`} style={{ backgroundColor: isTaskCompleted ? routine.color : 'transparent' }} aria-label={`Mark task ${task.text} as ${isTaskCompleted ? 'incomplete' : 'complete'}`}>
                                                        {isTaskCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </button>
                                                    <span className={`flex-grow transition-opacity ${isTaskCompleted ? 'line-through opacity-50' : ''}`}>{task.text}</span>
                                                    {task.budget !== undefined && (<span className={`text-xs font-mono px-2 py-0.5 rounded-full bg-black/20 ${isTaskCompleted ? 'opacity-50' : ''}`}>${task.budget.toFixed(2)}</span>)}
                                                </li>
                                            );
                                        })
                                    ) : (<li>No tasks for this item.</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <footer className={'mt-auto pt-3 border-t border-white/10'}>
                    <div className="flex justify-between items-end">
                        <div className="text-left min-w-0">
                            <p className={`text-sm font-mono truncate ${themeConfig.textColor}`}>{!isTaskOrPayment ? `${routine.startTime} - ${routine.endTime}` : ''}</p>
                            <p className={`text-xs truncate ${themeConfig.subtextColor}`}>{formatRepetition(routine)}</p>
                        </div>
                        <div className="flex items-center -mr-2">
                           <button onClick={onToggleExpand} aria-expanded={isExpanded} aria-label={isExpanded ? 'Collapse' : 'Expand'} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                           {canEditRoutine(routine) && (<button onClick={handleEdit} aria-label={`Edit`} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>)}
                           {canDeleteRoutine(routine) && (<button onClick={handleDelete} aria-label={`Delete`} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>)}
                            <div onMouseDown={onInteractionStart} onTouchStart={onInteractionStart} className="p-2 cursor-grab active:cursor-grabbing rounded-full hover:bg-white/10 transition-colors" aria-label="Drag to reorder">
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${themeConfig.subtextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M5 12h.01M19 12h.01" /></svg>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </article>
    );
}));

export default RoutineCard;