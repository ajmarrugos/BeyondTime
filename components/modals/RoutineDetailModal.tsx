
import React, { useState, useEffect } from 'react';
import RoutineCard from '../RoutineCard';
import { Routine } from '../../types';
import { useModal } from '../../contexts/ModalContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { DURATION_NORMAL } from '../../config/constants';

interface RoutineDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    routine: Routine | null;
    // FIX: Props are no longer needed as data is fetched from context.
}

const RoutineDetailModal: React.FC<RoutineDetailModalProps> = ({
    isOpen,
    onClose,
    routine,
}) => {
    const { openRoutineModalForEdit, confirm } = useModal();
    // FIX: Consolidated data fetching to use the main AppDataContext.
    const { deleteRoutine, completedTasks, handleToggleTask: onToggleTask } = useAppData();
    const { addToast } = useToast();
    const { canDeleteRoutine, canEditRoutine } = usePermissions();

    const [isExpanded, setIsExpanded] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, DURATION_NORMAL);
    };

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            // when a new routine is passed (modal is reused), reset expansion state
            setIsExpanded(true); 
        }
    }, [isOpen, routine]);

    if (!routine) {
        return null;
    }

    const handleDelete = () => {
        if (canDeleteRoutine(routine)) {
            confirm({
                title: 'Delete Item',
                message: `Are you sure you want to delete "${routine.name}"? This cannot be undone.`,
                onConfirm: () => {
                    handleClose();
                    // wait for modal to close before deleting, otherwise it looks weird
                    setTimeout(() => {
                        deleteRoutine(routine.id);
                        addToast("Item deleted.", 'success');
                    }, DURATION_NORMAL);
                },
                confirmText: 'Delete',
            });
        } else {
            addToast("You don't have permission to delete this item.", 'error');
        }
    };

    const handleEdit = () => {
        if (canEditRoutine(routine)) {
            handleClose();
            // wait for this modal to start closing before opening the other
            setTimeout(() => {
                openRoutineModalForEdit(routine);
            }, DURATION_NORMAL / 2);
        } else {
            addToast("You don't have permission to edit this item.", 'error');
        }
    };
    
    const cardActions = {
        delete: handleDelete,
        edit: handleEdit,
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${
                isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm transition-transform duration-300 ease-in-out ${
                    isOpen && !isClosing ? 'scale-100' : 'scale-95'
                }`}
            >
                <RoutineCard
                    routine={routine}
                    isPlaceholder={false}
                    isDeleting={false}
                    actions={cardActions}
                    onDeleteAnimationEnd={() => {}}
                    onInteractionStart={(e) => e.preventDefault()}
                    completedTaskIds={new Set(completedTasks[routine.id] || [])}
                    onToggleTask={(taskId) => onToggleTask(routine.id, taskId)}
                    isExpanded={isExpanded}
                    onToggleExpand={() => setIsExpanded((prev) => !prev)}
                />
            </div>
        </div>
    );
};

export default RoutineDetailModal;