import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
import { Routine, Member } from '../types';
import { DURATION_NORMAL } from '../config/constants';

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface ModalContextType {
    isRoutineModalMounted: boolean;
    isRoutineModalOpen: boolean;
    openRoutineModal: (memberId?: number) => void;
    closeRoutineModal: () => void;
    handleRoutineModalExited: () => void;

    editingRoutine: Routine | null;
    openRoutineModalForEdit: (routine: Routine) => void;

    preselectedMemberId: number | null;

    isConfirmModalOpen: boolean;
    confirmModalProps: ConfirmModalProps | null;
    confirm: (props: ConfirmModalProps) => void;
    handleConfirm: () => void;
    handleCancelConfirm: () => void;
    
    isRoutineDetailModalOpen: boolean;
    detailRoutine: Routine | null;
    openRoutineDetailModal: (routine: Routine) => void;
    closeRoutineDetailModal: () => void;

    // New separate modals for team/member management
    isAddMemberModalOpen: boolean;
    openAddMemberModal: () => void;
    closeAddMemberModal: () => void;

    isEditMemberModalOpen: boolean;
    memberToEdit: Member | null;
    openEditMemberModal: (member: Member) => void;
    closeEditMemberModal: () => void;

    isTeamSettingsModalOpen: boolean;
    openTeamSettingsModal: () => void;
    closeTeamSettingsModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Add/Edit Routine Modal State
    const [isRoutineModalMounted, setIsRoutineModalMounted] = useState(false);
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [preselectedMemberId, setPreselectedMemberId] = useState<number | null>(null);

    const openRoutineModal = useCallback((memberId?: number) => {
        if (memberId) {
            setPreselectedMemberId(memberId);
        }
        setIsRoutineModalMounted(true);
        setTimeout(() => setIsRoutineModalOpen(true), 10);
    }, []);
    
    const openRoutineModalForEdit = useCallback((routine: Routine) => {
        setEditingRoutine(routine);
        openRoutineModal();
    }, [openRoutineModal]);

    const closeRoutineModal = useCallback(() => setIsRoutineModalOpen(false), []);
    const handleRoutineModalExited = useCallback(() => {
        setIsRoutineModalMounted(false);
        setEditingRoutine(null);
        setPreselectedMemberId(null);
    }, []);
    
    // Confirm Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps | null>(null);

    const confirm = useCallback((props: ConfirmModalProps) => {
        setConfirmModalProps(props);
        setIsConfirmModalOpen(true);
    }, []);
    
    const handleConfirm = useCallback(() => {
        if (confirmModalProps) confirmModalProps.onConfirm();
        setIsConfirmModalOpen(false);
        setTimeout(() => setConfirmModalProps(null), DURATION_NORMAL);
    }, [confirmModalProps]);

    const handleCancelConfirm = useCallback(() => {
        setIsConfirmModalOpen(false);
        setTimeout(() => setConfirmModalProps(null), DURATION_NORMAL);
    }, []);

    // Routine Detail Modal State
    const [isRoutineDetailModalOpen, setIsRoutineDetailModalOpen] = useState(false);
    const [detailRoutine, setDetailRoutine] = useState<Routine | null>(null);

    const openRoutineDetailModal = useCallback((routine: Routine) => {
        setDetailRoutine(routine);
        setIsRoutineDetailModalOpen(true);
    }, []);

    const closeRoutineDetailModal = useCallback(() => {
        setIsRoutineDetailModalOpen(false);
        setTimeout(() => setDetailRoutine(null), DURATION_NORMAL);
    }, []);

    // --- New Management Modals State ---
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const openAddMemberModal = useCallback(() => setIsAddMemberModalOpen(true), []);
    const closeAddMemberModal = useCallback(() => setIsAddMemberModalOpen(false), []);

    const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
    const openEditMemberModal = useCallback((member: Member) => {
        setMemberToEdit(member);
        setIsEditMemberModalOpen(true);
    }, []);
    const closeEditMemberModal = useCallback(() => {
        setIsEditMemberModalOpen(false);
        setTimeout(() => setMemberToEdit(null), DURATION_NORMAL);
    }, []);
    
    const [isTeamSettingsModalOpen, setIsTeamSettingsModalOpen] = useState(false);
    const openTeamSettingsModal = useCallback(() => setIsTeamSettingsModalOpen(true), []);
    const closeTeamSettingsModal = useCallback(() => setIsTeamSettingsModalOpen(false), []);


    const value = useMemo(() => ({
        isRoutineModalMounted, isRoutineModalOpen, openRoutineModal, closeRoutineModal, handleRoutineModalExited,
        editingRoutine, openRoutineModalForEdit,
        preselectedMemberId,
        isConfirmModalOpen, confirmModalProps, confirm, handleConfirm, handleCancelConfirm,
        isRoutineDetailModalOpen, detailRoutine, openRoutineDetailModal, closeRoutineDetailModal,
        isAddMemberModalOpen, openAddMemberModal, closeAddMemberModal,
        isEditMemberModalOpen, memberToEdit, openEditMemberModal, closeEditMemberModal,
        isTeamSettingsModalOpen, openTeamSettingsModal, closeTeamSettingsModal,
    }), [
        isRoutineModalMounted, isRoutineModalOpen, openRoutineModal, closeRoutineModal, handleRoutineModalExited,
        editingRoutine, openRoutineModalForEdit,
        preselectedMemberId,
        isConfirmModalOpen, confirmModalProps, confirm, handleConfirm, handleCancelConfirm,
        isRoutineDetailModalOpen, detailRoutine, openRoutineDetailModal, closeRoutineDetailModal,
        isAddMemberModalOpen, openAddMemberModal, closeAddMemberModal,
        isEditMemberModalOpen, memberToEdit, openEditMemberModal, closeEditMemberModal,
        isTeamSettingsModalOpen, openTeamSettingsModal, closeTeamSettingsModal,
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