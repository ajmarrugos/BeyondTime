import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { vibrate } from '../../utils/haptics';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    const { themeConfig } = useTheme();
    const modalRef = useFocusTrap(isOpen);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onCancel]);

    const handleConfirmClick = () => {
        onConfirm();
        vibrate([50, 100, 50]);
    };
    
    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="confirm-modal-title"
        >
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border border-white/10 flex flex-col ${themeConfig.cardBg} transition-transform duration-300 ease-in-out ${
                    isOpen ? 'scale-100' : 'scale-95'
                }`}
            >
                <h2 id="confirm-modal-title" className={`text-2xl font-bold ${themeConfig.textColor}`}>
                    {title}
                </h2>
                <p className={`mt-2 ${themeConfig.subtextColor}`}>
                    {message}
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onCancel}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${themeConfig.textColor} bg-white/5 hover:bg-white/10`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirmClick}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30 transition-all`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
