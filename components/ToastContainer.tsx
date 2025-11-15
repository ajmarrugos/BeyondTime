import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
    const { themeConfig } = useTheme();

    const typeClasses = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400',
    };
    
    const iconPaths = {
        success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
        warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    };

    return (
        <div className={`toast-enter w-full max-w-sm p-4 rounded-2xl shadow-2xl flex items-start space-x-3 ${themeConfig.cardBg} backdrop-blur-xl border border-white/10`}>
            <div className={`w-6 h-6 flex-shrink-0 ${typeClasses[type]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[type]} />
                </svg>
            </div>
            <p className={`flex-grow pt-0.5 ${themeConfig.textColor}`}>{message}</p>
        </div>
    );
};


const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-6 right-6 z-[100] space-y-3" role="alert" aria-live="assertive">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} />
            ))}
        </div>
    );
};

export default ToastContainer;
