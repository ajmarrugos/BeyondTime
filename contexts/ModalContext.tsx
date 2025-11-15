import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
import { Routine } from '../types';
import { DURATION_NORMAL } from '../config/constants';

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    // FIX: Add optional confirmText and cancelText to allow customization of the modal buttons.
    confirmText?: string;
    cancelText?: string;
}

interface ModalContextType {
    isRoutineModalMounted: boolean;
    isRoutineModalOpen: boolean;
    openRoutineModal: () => void;
    closeRoutineModal: () => void;
    handleRoutineModalExited: () => void;

    editingRoutine: Routine | null;
    openRoutineModalForEdit: (routine: Routine) => void;

    isConfirmModalOpen: boolean;
    confirmModalProps: ConfirmModalProps | null;
    confirm: (props: ConfirmModalProps) => void;
    handleConfirm: () => void;
    handleCancelConfirm: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Add/Edit Routine Modal State
    const [isRoutineModalMounted, setIsRoutineModalMounted] = useState(false);
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

    const openRoutineModal = useCallback(() => {
        setIsRoutineModalMounted(true);
        setTimeout(() => setIsRoutineModalOpen(true), 10); // allow mounting before transition
    }, []);
    
    const openRoutineModalForEdit = useCallback((routine: Routine) => {
        setEditingRoutine(routine);
        openRoutineModal();
    }, [openRoutineModal]);

    const closeRoutineModal = useCallback(() => {
        setIsRoutineModalOpen(false);
    }, []);

    const handleRoutineModalExited = useCallback(() => {
        setIsRoutineModalMounted(false);
        setEditingRoutine(null);
    }, []);
    
    // Confirm Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps | null>(null);

    const confirm = useCallback((props: ConfirmModalProps) => {
        setConfirmModalProps(props);
        setIsConfirmModalOpen(true);
    }, []);
    
    const handleConfirm = useCallback(() => {
        if (confirmModalProps) {
            confirmModalProps.onConfirm();
        }
        setIsConfirmModalOpen(false);
        setTimeout(() => setConfirmModalProps(null), DURATION_NORMAL);
    }, [confirmModalProps]);

    const handleCancelConfirm = useCallback(() => {
        setIsConfirmModalOpen(false);
        setTimeout(() => setConfirmModalProps(null), DURATION_NORMAL);
    }, []);

    const value = useMemo(() => ({
        isRoutineModalMounted, isRoutineModalOpen, openRoutineModal, closeRoutineModal, handleRoutineModalExited,
        editingRoutine, openRoutineModalForEdit,
        isConfirmModalOpen, confirmModalProps, confirm, handleConfirm, handleCancelConfirm
    }), [
        isRoutineModalMounted, isRoutineModalOpen, openRoutineModal, closeRoutineModal, handleRoutineModalExited,
        editingRoutine, openRoutineModalForEdit,
        isConfirmModalOpen, confirmModalProps, confirm, handleConfirm, handleCancelConfirm
    ]);

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
