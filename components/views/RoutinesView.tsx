import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Routine } from '../../types';
import RoutineCard from '../RoutineCard';
import ViewHeader from '../ui/ViewHeader';
import { useRoutineContext } from '../../contexts/RoutineContext';
import { useMemberContext } from '../../contexts/MemberContext';
import { useModal } from '../../contexts/ModalContext';
import { useDragState } from '../../contexts/DragStateContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import RoutineMetrics from '../ui/RoutineMetrics';
import { useVirtualization } from '../../hooks/useVirtualization';

interface RoutinesViewProps {
    routines: Routine[];
    deletingRoutineId: number | null;
    onDeleteRoutine: (id: number) => void;
    onEditRoutine: (id: number) => void;
    onDeleteAnimationEnd: (id: number) => void;
    completedTasks: Record<number, number[]>;
    onToggleTask: (routineId: number, taskId: number) => void;
}

const ROW_PADDING_BOTTOM = 12; // Adjusted for consistent vertical rhythm

// Constants for dynamic height calculation
const BASE_COLLAPSED_HEIGHT = 184;
const BASE_EXPANDED_HEIGHT = 180; // Base height of expanded card (header, footer, padding, separators)
const HEIGHT_PER_TASK = 44;       // Approx height of a task item
const HEIGHT_PER_DESC_LINE = 20;  // Approx height of a line of description text
const CHARS_PER_DESC_LINE = 45;   // Approx characters per line in the description
const BUDGET_SECTION_HEIGHT = 70; // Approx height of the budget section

const RoutinesView: React.FC<RoutinesViewProps> = ({ 
    routines, 
    deletingRoutineId,
    onDeleteRoutine,
    onEditRoutine,
    onDeleteAnimationEnd,
    completedTasks,
    onToggleTask
}) => {
    const { setRoutines } = useRoutineContext();
    const { members } = useMemberContext();
    const { openRoutineModal } = useModal();
    const { setIsDraggingRoutine } = useDragState();
    const { themeConfig } = useTheme();
    const currentTime = useCurrentTime();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeId, setActiveId] = useState<number | null>(null);
    const [expandedRoutineId, setExpandedRoutineId] = useState<number | null>(null);

    const dragOverItem = useRef<number | null>(null);
    const routineCardRefs = useRef<Map<number, HTMLElement | null>>(new Map());
    const portalContainer = document.getElementById('portal-root');
    const containerRef = useRef<HTMLDivElement>(null);

    const routineMetrics = useMemo(() => {
        const isRoutineLive = (routine: Routine) => {
            if (!routine.autoLive) return false;
            const now = currentTime;
            const [startHour, startMinute] = routine.startTime.split(':').map(Number);
            const startTime = new Date(now);
            startTime.setHours(startHour, startMinute, 0, 0);
            const [endHour, endMinute] = routine.endTime.split(':').map(Number);
            const endTime = new Date(now);
            endTime.setHours(endHour, endMinute, 0, 0);
            if (endTime.getTime() <= startTime.getTime()) {
              return now.getTime() >= startTime.getTime() || now.getTime() < endTime.getTime();
            }
            return now.getTime() >= startTime.getTime() && now.getTime() < endTime.getTime();
        };

        const isRoutineCompleted = (routine: Routine) => {
             if (routine.tasks.length === 0) {
                return false;
            }
            const completedIds = completedTasks[routine.id] || [];
            return routine.tasks.every(task => completedIds.includes(task.id));
        };
        
        const isRoutineActiveOnDate = (routine: Routine, date: Date) => {
            const dayOfWeek = date.getDay();
            const dayOfMonth = date.getDate();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const isoDate = `${year}-${month}-${day}`;
    
            switch (routine.repetition) {
                case 'Daily': return true;
                case 'Weekly': return routine.weekdays?.includes(dayOfWeek) ?? false;
                case 'Monthly': return routine.monthDays?.includes(dayOfMonth) ?? false;
                case 'Annually': return routine.annualDates?.includes(isoDate) ?? false;
                default: return false; // 'None' doesn't contribute to future task counts
            }
        };
    
        const calculateTasksForDateRange = (days: number): number => {
            let total = 0;
            const today = new Date();
            for (let i = 0; i < days; i++) {
                const dateToCheck = new Date();
                dateToCheck.setDate(today.getDate() + i);
                routines.forEach(routine => {
                    if (isRoutineActiveOnDate(routine, dateToCheck)) {
                        total += routine.tasks.length;
                    }
                });
            }
            return total;
        };
        
        const today = new Date();
        const todaysActiveRoutines = routines.filter(r => isRoutineActiveOnDate(r, today));
        const totalTasksToday = todaysActiveRoutines.reduce((acc, r) => acc + r.tasks.length, 0);
        
        const totalRoutines = routines.length;
        const liveNow = routines.filter(r => isRoutineLive(r) && !isRoutineCompleted(r)).length;
        const completed = routines.filter(isRoutineCompleted).length;
        
        const totalTasksOfWeek = calculateTasksForDateRange(7);
        const totalTasksOfMonth = calculateTasksForDateRange(30);
    
        return { totalRoutines, liveNow, completed, totalTasks: totalTasksToday, totalTasksOfWeek, totalTasksOfMonth };
    }, [routines, completedTasks, currentTime]);


    const filteredRoutines = useMemo(() => {
        if (!searchQuery.trim()) {
            return routines;
        }

        const query = searchQuery.toLowerCase().trim();
        const queryTokens = query.split(/\s+/).filter(Boolean);

        const scoredRoutines = routines.map(routine => {
            let score = 0;
            const member = members.find(m => m.id === routine.memberId);

            const name = routine.name.toLowerCase();
            const description = routine.description.toLowerCase();
            const tags = routine.tags.map(t => t.toLowerCase()).join(' ');
            const memberName = member ? member.name.toLowerCase() : '';

            // Token-based scoring with weights
            for (const token of queryTokens) {
                if (name.includes(token)) score += 4;
                if (tags.includes(token)) score += 3;
                if (description.includes(token)) score += 2;
                if (memberName.includes(token)) score += 1;
            }

            // Exact phrase bonus
            if (name.includes(query)) score += 10;
            if (tags.includes(query)) score += 5; // Bonus for exact tag match

            return { routine, score };
        });

        return scoredRoutines
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.routine);

    }, [routines, searchQuery, members]);
    
    // Virtualization Hook with dynamic height calculation
    const getItemHeight = useCallback((index: number) => {
        const routine = filteredRoutines[index];
        if (routine && routine.id === expandedRoutineId) {
            let height = BASE_EXPANDED_HEIGHT;
            
            // Add height for description
            if (routine.description) {
                height += Math.ceil(routine.description.length / CHARS_PER_DESC_LINE) * HEIGHT_PER_DESC_LINE;
            } else {
                height += HEIGHT_PER_DESC_LINE; // "No description provided."
            }
    
            // Add height for tasks
            if (routine.tasks.length > 0) {
                height += routine.tasks.length * HEIGHT_PER_TASK;
            } else {
                height += HEIGHT_PER_TASK; // "No tasks for this routine."
            }
            
            // Add height for budget section if it will be rendered
            const totalBudget = routine.tasks.reduce((sum, task) => sum + (task.budget || 0), 0);
            if (totalBudget > 0) {
                height += BUDGET_SECTION_HEIGHT;
            }
    
            return height;
        }
        return BASE_COLLAPSED_HEIGHT;
    }, [filteredRoutines, expandedRoutineId]);

    const { totalHeight, visibleItems } = useVirtualization({
        itemCount: filteredRoutines.length,
        getItemHeight,
        containerRef,
    });

    const handleToggleExpand = useCallback((routineId: number) => {
        setExpandedRoutineId(prevId => (prevId === routineId ? null : routineId));
    }, []);

    // State for the dragged clone's position and size
    const [draggedElementState, setDraggedElementState] = useState<{
        routine: Routine | null;
        rect: DOMRect | null;
        offset: { x: number, y: number };
    }>({ routine: null, rect: null, offset: { x: 0, y: 0 } });

    const handleDrop = useCallback(() => {
        if (activeId === null || dragOverItem.current === null || activeId === dragOverItem.current) {
            return;
        }
    
        const reorderedRoutines = [...routines];
        const draggedItemIndex = reorderedRoutines.findIndex(r => r.id === activeId);
        const dragOverItemIndex = reorderedRoutines.findIndex(r => r.id === dragOverItem.current);
    
        if (draggedItemIndex === -1 || dragOverItemIndex === -1) return;
    
        const [removedItem] = reorderedRoutines.splice(draggedItemIndex, 1);
        reorderedRoutines.splice(dragOverItemIndex, 0, removedItem);
    
        setRoutines(reorderedRoutines);
    }, [activeId, routines, setRoutines]);

    const handleDragEnd = useCallback(() => {
        handleDrop();
        setActiveId(null);
        setIsDraggingRoutine(false);
        setDraggedElementState({ routine: null, rect: null, offset: { x: 0, y: 0 } });
        dragOverItem.current = null;
    }, [handleDrop, setIsDraggingRoutine]);

    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!draggedElementState.rect) return;

        requestAnimationFrame(() => {
            setDraggedElementState(prev => {
                if (!prev.rect) return prev;
                return { ...prev, offset: { x: clientX - prev.rect.left, y: clientY - prev.rect.top } };
            });
        });

        const elements = document.elementsFromPoint(clientX, clientY);
        const dropTarget = elements.find(el => (el as HTMLElement).dataset?.routineId);
        if (dropTarget) {
            const targetId = Number((dropTarget as HTMLElement).dataset.routineId);
            if (targetId !== activeId) {
                dragOverItem.current = targetId;
            }
        }
    }, [activeId, draggedElementState.rect]);

    const handleDragStart = useCallback((id: number, e: React.MouseEvent | React.TouchEvent) => {
        const routine = routines.find(r => r.id === id);
        const element = routineCardRefs.current.get(id);
        if (!routine || !element) return;
        
        e.stopPropagation();
        
        const rect = element.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setActiveId(id);
        setIsDraggingRoutine(true);
        setDraggedElementState({
            routine,
            rect,
            offset: { x: clientX - rect.left, y: clientY - rect.top }
        });
    }, [routines, setIsDraggingRoutine]);

    useEffect(() => {
        const moveHandler = (e: MouseEvent | TouchEvent) => {
            if (!activeId) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            handleDragMove(clientX, clientY);
        };

        if (activeId) {
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('touchmove', moveHandler);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [activeId, handleDragMove, handleDragEnd]);
    
    // Memoize handlers for RoutineCard to prevent re-renders
    const onDeleteRoutineCallback = useCallback(onDeleteRoutine, [onDeleteRoutine]);
    const onEditRoutineCallback = useCallback(onEditRoutine, [onEditRoutine]);
    const onDeleteAnimationEndCallback = useCallback(onDeleteAnimationEnd, [onDeleteAnimationEnd]);
    const onToggleTaskCallback = useCallback(onToggleTask, [onToggleTask]);
    const onInteractionStartCallback = useCallback(handleDragStart, [handleDragStart]);
    const onToggleExpandCallback = useCallback(handleToggleExpand, [handleToggleExpand]);

    return (
        <div className="relative w-full h-full flex flex-col z-10 p-6 pt-0">
            <ViewHeader 
                title="Routines"
                actionButton={{ label: "Add", onClick: openRoutineModal }}
            />

            {routines.length > 0 && (
                <>
                    <div className="relative mb-3 max-w-3xl mx-auto w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className={`h-5 w-5 ${themeConfig.subtextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            placeholder="Search routines..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full p-3 pl-10 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`}
                        />
                    </div>
                    <RoutineMetrics {...routineMetrics} />
                </>
            )}

            {routines.length > 0 ? (
                <div ref={containerRef} className="flex-1 overflow-y-auto -mx-6 px-6 pb-4">
                    <div className="max-w-3xl mx-auto relative" style={{ height: `${totalHeight}px` }}>
                        {filteredRoutines.length > 0 ? (
                            visibleItems.map(({ index, style }) => {
                                const routine = filteredRoutines[index];
                                if (!routine) return null;
                                return (
                                     <div 
                                        key={routine.id} 
                                        style={{ 
                                            ...style, 
                                            paddingBottom: `${ROW_PADDING_BOTTOM}px`,
                                            boxSizing: 'border-box',
                                            transition: 'top 300ms ease-in-out, height 300ms ease-in-out',
                                        }}
                                     >
                                        <RoutineCard 
                                            routine={routine}
                                            ref={el => {
                                                if (el) routineCardRefs.current.set(routine.id, el);
                                                else routineCardRefs.current.delete(routine.id);
                                            }}
                                            isPlaceholder={activeId === routine.id}
                                            isDeleting={deletingRoutineId === routine.id}
                                            onDelete={onDeleteRoutineCallback}
                                            onEdit={onEditRoutineCallback}
                                            onDeleteAnimationEnd={onDeleteAnimationEndCallback}
                                            onInteractionStart={(e) => onInteractionStartCallback(routine.id, e)}
                                            completedTaskIds={new Set(completedTasks[routine.id] || [])}
                                            onToggleTask={(taskId) => onToggleTaskCallback(routine.id, taskId)}
                                            isExpanded={expandedRoutineId === routine.id}
                                            onToggleExpand={() => onToggleExpandCallback(routine.id)}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 absolute w-full">
                                <h3 className={`text-xl font-medium ${themeConfig.textColor}`}>No Routines Found</h3>
                                <p className={themeConfig.subtextColor}>Your search for "{searchQuery}" did not match any routines.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <svg className="h-24 w-24 text-gray-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                     <h2 className="text-2xl font-medium text-gray-200 mt-6">No Routines Yet</h2>
                     <p className="mt-2 max-w-sm text-gray-400">
                        Click 'Add' to create your first routine.
                    </p>
                </div>
            )}

            {portalContainer && draggedElementState.routine && draggedElementState.rect && ReactDOM.createPortal(
                <div
                    className="fixed top-0 left-0 pointer-events-none z-50"
                    style={{
                        width: draggedElementState.rect.width,
                        height: draggedElementState.rect.height,
                        transform: `translate(${draggedElementState.rect.left + draggedElementState.offset.x}px, ${draggedElementState.rect.top + draggedElementState.offset.y}px)`,
                    }}
                >
                    <div style={{ transform: 'translate(-50%, -50%) scale(1.05) rotate(1deg)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <RoutineCard
                            routine={draggedElementState.routine}
                            isPlaceholder={false}
                            isDeleting={false}
                            onDelete={() => {}}
                            onEdit={() => {}}
                            onDeleteAnimationEnd={() => {}}
                            onInteractionStart={() => {}}
                            completedTaskIds={new Set()}
                            onToggleTask={() => {}}
                            isExpanded={false}
                            onToggleExpand={() => {}}
                        />
                    </div>
                </div>,
                portalContainer
            )}
        </div>
    );
};

export default RoutinesView;