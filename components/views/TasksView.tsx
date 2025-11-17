



import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Routine } from '../../types';
import RoutineCard from '../RoutineCard';
import ViewHeader from '../ui/ViewHeader';
import { useAppData } from '../../contexts/AppDataContext';
import { useModal } from '../../contexts/ModalContext';
import { useDragState } from '../../contexts/DragStateContext';
import { useTheme } from '../../contexts/ThemeContext';
import SummaryMetrics from '../ui/RoutineMetrics';
import { useVirtualization } from '../../hooks/useVirtualization';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../contexts/ToastContext';
import ViewSwitcher from '../ui/ViewSwitcher';

interface TasksViewProps {
    routines: Routine[];
    completedTasks: Record<number, number[]>;
    onToggleTask: (routineId: number, taskId: number) => void;
}

const ROW_PADDING_BOTTOM = 12;
const BASE_COLLAPSED_HEIGHT = 184;
const BASE_EXPANDED_HEIGHT = 230;
const HEIGHT_PER_TASK = 44;
const HEIGHT_PER_DESC_LINE = 20;
const CHARS_PER_DESC_LINE = 45;
const BUDGET_SECTION_HEIGHT = 70;

const TasksView: React.FC<TasksViewProps> = ({ 
    routines, 
    completedTasks,
    onToggleTask
}) => {
    const { setRoutines, members, deleteRoutine } = useAppData();
    const { openRoutineModal, openRoutineModalForEdit, confirm } = useModal();
    const { setIsDraggingRoutine } = useDragState();
    const { canDeleteRoutine, canEditRoutine } = usePermissions();
    const { addToast } = useToast();
    const { themeConfig } = useTheme();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'All' | 'Tasks' | 'Payments'>('All');
    const [activeId, setActiveId] = useState<number | null>(null);
    const [expandedRoutineId, setExpandedRoutineId] = useState<number | null>(null);
    const [deletingRoutineId, setDeletingRoutineId] = useState<number | null>(null);

    const dragOverItem = useRef<number | null>(null);
    const routineCardRefs = useRef<Map<number, HTMLElement | null>>(new Map());
    const portalContainer = document.getElementById('portal-root');
    const containerRef = useRef<HTMLDivElement>(null);

    const summaryMetrics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskItems = routines.filter(r => r.tags.includes('Task'));
        const paymentItems = routines.filter(r => r.tags.includes('Payment'));
        
        const isCompleted = (item: Routine) => {
            const completedIds = new Set(completedTasks[item.id] || []);
            return completedIds.has(0);
        };
        
        const getDueDate = (item: Routine): Date | null => {
            if (!item.annualDates?.[0]) return null;
            return new Date(item.annualDates[0] + 'T00:00:00');
        };
        
        const getItemAmount = (item: Routine): number => {
            return item.budget || 0;
        };
        
        const formatCurrency = (value: number) => {
            if (value >= 1000) {
                return `$${(value / 1000).toFixed(1)}k`;
            }
            return `$${value.toFixed(0)}`;
        }

        switch(filter) {
            case 'Tasks': {
                const pending = taskItems.filter(t => !isCompleted(t)).length;
                return {
                    mainMetrics: [
                        { value: taskItems.length, label: 'Total Tasks' },
                        { value: pending, label: 'Pending' },
                        { value: taskItems.length - pending, label: 'Completed' },
                    ],
                    expandedMetrics: []
                };
            }
            case 'Payments': {
                let upcomingAmount = 0;
                let overdueAmount = 0;
                paymentItems.forEach(p => {
                    const dueDate = getDueDate(p);
                    if (!dueDate || isCompleted(p)) return;
                    
                    const amount = getItemAmount(p);
                    if (dueDate < today) {
                        overdueAmount += amount;
                    } else {
                        upcomingAmount += amount;
                    }
                });
                return {
                    mainMetrics: [
                        { value: paymentItems.length, label: 'Payments' },
                        { value: upcomingAmount, label: 'Upcoming' },
                        { value: overdueAmount, label: 'Overdue' },
                    ],
                    expandedMetrics: [
                        { value: upcomingAmount, label: `Upcoming (${formatCurrency(upcomingAmount)})` },
                        { value: overdueAmount, label: `Overdue (${formatCurrency(overdueAmount)})` },
                        { value: upcomingAmount + overdueAmount, label: `Total Due (${formatCurrency(upcomingAmount + overdueAmount)})` }
                    ]
                };
            }
            case 'All':
            default: {
                const pendingTasks = taskItems.filter(t => !isCompleted(t)).length;
                const upcomingPayments = paymentItems.filter(p => {
                    const dueDate = getDueDate(p);
                    return dueDate && dueDate >= today && !isCompleted(p);
                }).length;
                 return {
                     mainMetrics: [
                        { value: routines.length, label: 'Total Items' },
                        { value: pendingTasks, label: 'Pending Tasks' },
                        { value: upcomingPayments, label: 'Upcoming Payments' }
                    ],
                    expandedMetrics: []
                };
            }
        }
    }, [routines, completedTasks, filter]);

    const filteredByTag = useMemo(() => {
        if (filter === 'All') return routines;
        return routines.filter(r => r.tags.includes(filter.slice(0, -1))); // Tasks -> Task
    }, [routines, filter]);

    const filteredRoutines = useMemo(() => {
        const sourceList = filteredByTag;
        if (!searchQuery.trim()) return sourceList;
        const query = searchQuery.toLowerCase().trim();
        const scoredRoutines = sourceList.map(routine => {
            let score = 0;
            const member = members.find(m => m.id === routine.memberId);
            if (routine.name.toLowerCase().includes(query)) score += 5;
            if (routine.tags.join(' ').toLowerCase().includes(query)) score += 3;
            if (routine.description.toLowerCase().includes(query)) score += 2;
            if (member?.name.toLowerCase().includes(query)) score += 1;
            return { routine, score };
        });
        return scoredRoutines.filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.routine);
    }, [filteredByTag, searchQuery, members]);
    
    const getItemHeight = useCallback((index: number) => {
        const routine = filteredRoutines[index];
        if (routine && routine.id === expandedRoutineId) {
            let height = BASE_EXPANDED_HEIGHT;
            if (routine.description) {
                height += Math.ceil(routine.description.length / CHARS_PER_DESC_LINE) * HEIGHT_PER_DESC_LINE;
            } else {
                height += HEIGHT_PER_DESC_LINE;
            }
            height += (routine.tasks.length > 0 ? routine.tasks.length : 1) * HEIGHT_PER_TASK;
            if (routine.budget) {
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
    
    const handleDeleteRoutine = useCallback((id: number) => {
        const routineToDelete = routines.find(r => r.id === id);
        if (!routineToDelete) return;

        if (canDeleteRoutine(routineToDelete)) {
            confirm({
                title: 'Delete Item',
                message: `Are you sure you want to delete "${routineToDelete.name}"? This cannot be undone.`,
                onConfirm: () => setDeletingRoutineId(id),
                confirmText: 'Delete',
            });
        } else {
            addToast("You don't have permission to delete this item.", 'error');
        }
    }, [routines, canDeleteRoutine, confirm, addToast]);

    const handleEditRoutine = useCallback((id: number) => {
        const routineToEdit = routines.find(r => r.id === id);
        if (!routineToEdit) return;

        if (canEditRoutine(routineToEdit)) {
            openRoutineModalForEdit(routineToEdit);
        } else {
            addToast("You don't have permission to edit this item.", 'error');
        }
    }, [routines, canEditRoutine, openRoutineModalForEdit, addToast]);

    const handleRoutineDeleteAnimationEnd = (id: number) => {
        deleteRoutine(id);
        setDeletingRoutineId(null);
        addToast("Item deleted.", 'success');
    };

    const [draggedElementState, setDraggedElementState] = useState<{
        routine: Routine | null;
        rect: DOMRect | null;
        offset: { x: number, y: number };
    }>({ routine: null, rect: null, offset: { x: 0, y: 0 } });

    const handleDrop = useCallback(() => {
        if (activeId === null || dragOverItem.current === null || activeId === dragOverItem.current) return;
        const reorderedRoutines = [...routines];
        const draggedIdx = reorderedRoutines.findIndex(r => r.id === activeId);
        const targetIdx = reorderedRoutines.findIndex(r => r.id === dragOverItem.current);
        if (draggedIdx === -1 || targetIdx === -1) return;
        const [removed] = reorderedRoutines.splice(draggedIdx, 1);
        reorderedRoutines.splice(targetIdx, 0, removed);
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
        setDraggedElementState(prev => ({ ...prev, offset: { x: clientX - prev.rect!.left, y: clientY - prev.rect!.top } }));
        const dropTarget = document.elementsFromPoint(clientX, clientY).find(el => (el as HTMLElement).dataset?.routineId);
        if (dropTarget) dragOverItem.current = Number((dropTarget as HTMLElement).dataset.routineId);
    }, [draggedElementState.rect]);

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
        setDraggedElementState({ routine, rect, offset: { x: clientX - rect.left, y: clientY - rect.top } });
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
    
    const cardActions = useMemo(() => ({
        delete: handleDeleteRoutine,
        edit: handleEditRoutine,
    }), [handleDeleteRoutine, handleEditRoutine]);

    const filterOptions = useMemo(() => [
        { label: 'All', value: 'All' as const },
        { label: 'Tasks', value: 'Tasks' as const },
        { label: 'Payments', value: 'Payments' as const }
    ], []);

    return (
        <div className="relative w-full h-full flex flex-col z-10 p-6 pt-0">
            <ViewHeader 
                title="Tasks & Payments"
                actionButton={{ label: "Add Item", onClick: openRoutineModal }}
            />
            
            {routines.length > 0 && (
                <SummaryMetrics 
                    mainMetrics={summaryMetrics.mainMetrics} 
                    expandedMetrics={summaryMetrics.expandedMetrics} 
                />
            )}

            {routines.length > 0 ? (
                <div ref={containerRef} className="flex-1 overflow-y-auto -mx-6 px-6">
                    <div className="max-w-3xl mx-auto relative" style={{ height: `${totalHeight}px` }}>
                        {filteredRoutines.length > 0 ? (
                            visibleItems.map(({ index, style }) => {
                                const routine = filteredRoutines[index];
                                if (!routine) return null;
                                return (
                                     <div key={routine.id} style={{ ...style, paddingBottom: `${ROW_PADDING_BOTTOM}px`, boxSizing: 'border-box' }}>
                                        <RoutineCard 
                                            routine={routine}
                                            ref={el => {
                                                if (el) {
                                                    routineCardRefs.current.set(routine.id, el);
                                                } else {
                                                    routineCardRefs.current.delete(routine.id);
                                                }
                                            }}
                                            isPlaceholder={activeId === routine.id}
                                            isDeleting={deletingRoutineId === routine.id}
                                            actions={cardActions}
                                            onDeleteAnimationEnd={handleRoutineDeleteAnimationEnd}
                                            onInteractionStart={(e) => handleDragStart(routine.id, e)}
                                            completedTaskIds={new Set(completedTasks[routine.id] || [])}
                                            onToggleTask={(taskId) => onToggleTask(routine.id, taskId)}
                                            isExpanded={expandedRoutineId === routine.id}
                                            onToggleExpand={() => handleToggleExpand(routine.id)}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 absolute w-full">
                                <h3 className={`text-xl font-medium ${themeConfig.textColor}`}>No Items Found</h3>
                                <p className={themeConfig.subtextColor}>Your search for "{searchQuery}" did not match any items.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <svg className="h-24 w-24 text-gray-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                     <h2 className="text-2xl font-medium text-gray-200 mt-6">No Tasks or Payments</h2>
                     <p className="mt-2 max-w-sm text-gray-400">Click 'Add Item' to create your first task or payment.</p>
                </div>
            )}

            {routines.length > 0 && (
                 <footer className="flex-shrink-0 pt-4">
                    <div className="relative mb-3 max-w-3xl mx-auto w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className={`h-5 w-5 ${themeConfig.subtextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input type="search" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full p-3 pl-10 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`} />
                    </div>
                    <ViewSwitcher
                        label="Filter items"
                        options={filterOptions}
                        selectedValue={filter}
                        onChange={(value) => setFilter(value)}
                    />
                </footer>
            )}

            {portalContainer && draggedElementState.routine && draggedElementState.rect && ReactDOM.createPortal(
                <div className="fixed top-0 left-0 pointer-events-none z-50" style={{ width: draggedElementState.rect.width, height: draggedElementState.rect.height, transform: `translate(${draggedElementState.rect.left + draggedElementState.offset.x}px, ${draggedElementState.rect.top + draggedElementState.offset.y}px)` }}>
                    <div style={{ transform: 'translate(-50%, -50%) scale(1.05) rotate(1deg)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <RoutineCard
                            routine={draggedElementState.routine}
                            isPlaceholder={false}
                            isDeleting={false}
                            actions={{ delete: () => {}, edit: () => {} }}
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

export default TasksView;