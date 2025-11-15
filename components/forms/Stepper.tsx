


import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface StepperProps {
    steps: string[];
    currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    const { themeConfig } = useTheme();
    return (
        <div className="px-6 pt-4 pb-2">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                                        isActive ? `bg-accent text-white ring-4 ring-accent/30` :
                                        isCompleted ? `bg-accent text-white` :
                                        `bg-black/20 ${themeConfig.textColor}`
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <p className={`mt-2 text-sm text-center font-semibold transition-colors duration-300 w-20 ${
                                    isActive ? themeConfig.textColor : themeConfig.subtextColor
                                }`}>
                                    {step}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-accent' : 'bg-black/20'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;