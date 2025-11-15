import React, { useState, useMemo, useEffect, useRef } from 'react';
import { routineColors, routineIcons } from '../../config/routineOptions';
import ColorPicker from '../forms/ColorPicker';
import IconPicker from '../forms/IconPicker';
import TagInput from '../forms/TagInput';
import ToggleSwitch from '../forms/ToggleSwitch';
import TaskList from '../forms/TaskList';
import { Routine } from '../../types';
import WeekdaySelector from '../forms/WeekdaySelector';
import MonthdaySelector from '../forms/MonthdaySelector';
import AnnualDatePicker from '../forms/AnnualDatePicker';
import Stepper from '../forms/Stepper';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../contexts/ToastContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AddRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExited: () => void;
    onAddRoutine: (routine: Routine) => void;
    onUpdateRoutine: (routine: Routine) => void;
    routineToEdit?: Routine | null;
}

const AddRoutineModal: React.FC<AddRoutineModalProps> = ({ isOpen, onExited, onAddRoutine, onUpdateRoutine, routineToEdit, ...props }) => {
    const { themeConfig } = useTheme();
    const { getManageableMembers } = usePermissions();
    const { addToast } = useToast();
    const availableMembers = getManageableMembers();
    const isEditMode = !!routineToEdit;

    // Form State
    const [routineName, setRoutineName] = useState('');
    const [memberId, setMemberId] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [color, setColor] = useState(routineColors[0]);
    const [icon, setIcon] = useState(routineIcons[0]);
    const [autoLive, setAutoLive] = useState(false);
    const [repetition, setRepetition] = useState<Routine['repetition']>('Daily');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [tasks, setTasks] = useState<{ id: number; text: string; budget?: number }[]>([]);
    
    // Notification state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notifyBefore, setNotifyBefore] = useState('5');
    const [notifyAtStart, setNotifyAtStart] = useState(true);
    const [notifyAtEnd, setNotifyAtEnd] = useState(false);

    // Detailed repetition state
    const [weekdays, setWeekdays] = useState<Set<number>>(new Set());
    const [monthDays, setMonthDays] = useState<Set<number>>(new Set());
    const [annualDates, setAnnualDates] = useState<string[]>([]);

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const steps = useMemo(() => ['Info', 'Scheduling', 'Tasks', 'Appearance'], []);
    const transitionRef = useRef<HTMLDivElement>(null);
    const modalRef = useFocusTrap(isOpen);

    // Effect to listen for transition end to unmount the component
    useEffect(() => {
        const node = transitionRef.current;
        if (!node) return;

        const handleTransitionEnd = (e: TransitionEvent) => {
            if (e.target === node && !isOpen) {
                onExited();
            }
        };

        node.addEventListener('transitionend', handleTransitionEnd);
        return () => {
            node.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [isOpen, onExited]);

     // Automatically select the first (or only) available member in add mode
    useEffect(() => {
        if (!isEditMode && availableMembers.length === 1) {
            setMemberId(availableMembers[0].id);
        }
    }, [availableMembers, isEditMode]);
    
    const resetForm = () => {
        setRoutineName('');
        setMemberId('');
        setDescription('');
        setTags([]);
        setColor(routineColors[0]);
        setIcon(routineIcons[0]);
        setAutoLive(false);
        setRepetition('Daily');
        setStartTime('09:00');
        setEndTime('10:00');
        setTasks([]);
        setWeekdays(new Set());
        setMonthDays(new Set());
        setAnnualDates([]);
        setNotificationsEnabled(true);
        setNotifyBefore('5');
        setNotifyAtStart(true);
        setNotifyAtEnd(false);
    };
    
    // Populate form when opening in edit mode
    useEffect(() => {
        if (isOpen && isEditMode) {
            setRoutineName(routineToEdit.name);
            setMemberId(routineToEdit.memberId);
            setDescription(routineToEdit.description);
            setTags(routineToEdit.tags);
            setColor(routineToEdit.color);
            setIcon(routineToEdit.icon);
            setAutoLive(routineToEdit.autoLive);
            setRepetition(routineToEdit.repetition);
            setStartTime(routineToEdit.startTime);
            setEndTime(routineToEdit.endTime);
            setTasks(routineToEdit.tasks);
            setWeekdays(new Set(routineToEdit.weekdays));
            setMonthDays(new Set(routineToEdit.monthDays));
            setAnnualDates(routineToEdit.annualDates || []);
            setNotificationsEnabled(routineToEdit.notifications?.enabled ?? true);
            setNotifyBefore(String(routineToEdit.notifications?.notifyBefore ?? 5));
            setNotifyAtStart(routineToEdit.notifications?.notifyAtStart ?? true);
            setNotifyAtEnd(routineToEdit.notifications?.notifyAtEnd ?? false);
        }
    }, [isOpen, isEditMode, routineToEdit]);


    const handleLocalClose = () => {
        setTimeout(() => {
            resetForm();
            setCurrentStep(1);
        }, 300); 
        props.onClose();
    };

    const handleSave = () => {
        if (!routineName.trim() || !memberId) {
            addToast('Please provide a routine name and select a member.', 'warning');
            return;
        }

        const newRoutineData = {
            name: routineName.trim(),
            memberId,
            description: description.trim(),
            tags,
            color,
            icon,
            autoLive,
            repetition,
            weekdays: repetition === 'Weekly' ? [...weekdays].sort((a,b) => a-b) : undefined,
            monthDays: repetition === 'Monthly' ? [...monthDays].sort((a,b) => a-b) : undefined,
            annualDates: repetition === 'Annually' ? annualDates.sort() : undefined,
            startTime,
            endTime,
            tasks,
            notifications: {
                enabled: notificationsEnabled,
                notifyBefore: parseInt(notifyBefore, 10) || 0,
                notifyAtStart: notifyAtStart,
                notifyAtEnd: notifyAtEnd
            }
        };

        if (isEditMode) {
            onUpdateRoutine({ ...newRoutineData, id: routineToEdit.id });
        } else {
            onAddRoutine({ ...newRoutineData, id: Date.now() });
        }

        handleLocalClose();
    };

    const handleWeekdayToggle = (day: number) => {
        setWeekdays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(day)) newSet.delete(day);
            else newSet.add(day);
            return newSet;
        });
    };

    const handleMonthdayToggle = (day: number) => {
        setMonthDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(day)) newSet.delete(day);
            else newSet.add(day);
            return newSet;
        });
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    const repetitionOptions: Routine['repetition'][] = ['None', 'Daily', 'Weekly', 'Monthly', 'Annually'];

    const inputBaseStyle = `w-full p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`;
    const selectBaseStyle = `${inputBaseStyle} appearance-none`;
    const stepContainerStyle = "absolute top-0 left-0 w-full h-full p-6 transition-all duration-300 ease-in-out";

    const getStepStyle = (step: number) => {
        if (step === currentStep) return 'translate-x-0 opacity-100';
        if (step < currentStep) return '-translate-x-full opacity-0 pointer-events-none';
        return 'translate-x-full opacity-0 pointer-events-none';
    };

    return (
        <div 
            ref={transitionRef}
            className={`fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => { if (e.target === e.currentTarget) handleLocalClose(); }}
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                className={`
                flex flex-col w-full h-full overflow-hidden
                ${themeConfig.background}
                md:max-w-xl lg:max-w-2xl md:h-auto md:min-h-[640px] md:max-h-[90vh] md:rounded-3xl md:shadow-2xl
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'scale-100' : 'scale-95'}
            `}>
                {/* Header */}
                <header className={`flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10`}>
                    <button onClick={handleLocalClose} aria-label="Close" className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h2 className={`text-xl font-bold ${themeConfig.textColor}`}>{isEditMode ? 'Edit Routine' : 'Create Routine'}</h2>
                    <div className="w-10 h-10"></div> {/* Spacer */}
                </header>

                <Stepper steps={steps} currentStep={currentStep} />

                {/* Form Content */}
                <div className="relative flex-1 overflow-y-auto min-h-0">
                    {/* Step 1: Info */}
                    <div className={`${stepContainerStyle} ${getStepStyle(1)}`}>
                        <div className="max-w-md mx-auto space-y-4">
                            <input type="text" placeholder="Routine Name" value={routineName} onChange={(e) => setRoutineName(e.target.value)} className={inputBaseStyle} />
                            
                            <div className="relative">
                                <select value={memberId} onChange={(e) => setMemberId(Number(e.target.value))} className={selectBaseStyle} disabled={availableMembers.length <= 1 && isEditMode}>
                                    <option value="">Select a member</option>
                                    {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${themeConfig.textColor}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputBaseStyle} h-32 resize-none`} />
                        </div>
                    </div>
                    {/* Step 2: Scheduling */}
                    <div className={`${stepContainerStyle} ${getStepStyle(2)}`}>
                        <div className="max-w-md mx-auto space-y-4">
                           <ToggleSwitch label="Auto-Live" enabled={autoLive} setEnabled={setAutoLive} />
                           
                           <div className="relative">
                                <label htmlFor="repetition" className={`block mb-2 font-medium ${themeConfig.textColor}`}>Repetition</label>
                                <select id="repetition" value={repetition} onChange={(e) => setRepetition(e.target.value as Routine['repetition'])} className={selectBaseStyle}>
                                   {repetitionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                               </select>
                                <div className={`pointer-events-none absolute bottom-3 right-0 flex items-center px-3 ${themeConfig.textColor}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </div>
                           </div>

                           {repetition === 'Weekly' && (
                                <WeekdaySelector selectedDays={weekdays} onDayToggle={handleWeekdayToggle} />
                           )}
                           {repetition === 'Monthly' && (
                                <MonthdaySelector selectedDays={monthDays} onDayToggle={handleMonthdayToggle} />
                           )}
                           {repetition === 'Annually' && (
                                <AnnualDatePicker dates={annualDates} setDates={setAnnualDates} />
                           )}

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="start-time" className={`block mb-2 font-medium ${themeConfig.textColor}`}>Start Time</label>
                                    <input type="time" id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputBaseStyle} />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="end-time" className={`block mb-2 font-medium ${themeConfig.textColor}`}>End Time</label>
                                    <input type="time" id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputBaseStyle} />
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <h4 className={`text-lg font-semibold mb-2 ${themeConfig.textColor}`}>Notifications</h4>
                                <div className="p-4 rounded-xl bg-black/20 space-y-4">
                                    <ToggleSwitch label="Enable Notifications" enabled={notificationsEnabled} setEnabled={setNotificationsEnabled} />
                                    <div className={`transition-opacity duration-300 ${!notificationsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <label className={`font-medium ${themeConfig.textColor}`}>Notify Before</label>
                                            <div className="flex items-center space-x-2">
                                                <input type="number" value={notifyBefore} onChange={e => setNotifyBefore(e.target.value)} min="0" className={`w-20 p-2 rounded-lg bg-black/20 ${themeConfig.textColor} text-center focus:outline-none focus:ring-2 focus:ring-accent`} />
                                                <span className={`${themeConfig.subtextColor}`}>minutes</span>
                                            </div>
                                        </div>
                                        <ToggleSwitch label="Notify at Start Time" enabled={notifyAtStart} setEnabled={setNotifyAtStart} />
                                        <ToggleSwitch label="Notify at End Time" enabled={notifyAtEnd} setEnabled={setNotifyAtEnd} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Step 3: Tasks */}
                    <div className={`${stepContainerStyle} ${getStepStyle(3)}`}>
                        <div className="max-w-md mx-auto space-y-4">
                            <div>
                                <h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Tasks</h4>
                                <TaskList tasks={tasks} setTasks={setTasks} />
                            </div>
                             <div>
                                <h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Tags</h4>
                                <TagInput tags={tags} setTags={setTags} />
                            </div>
                        </div>
                    </div>
                    {/* Step 4: Appearance */}
                    <div className={`${stepContainerStyle} ${getStepStyle(4)}`}>
                         <div className="max-w-md mx-auto space-y-4">
                            <div>
                                <h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Icon</h4>
                                <IconPicker icons={routineIcons} selectedIcon={icon} onSelectIcon={setIcon} />
                            </div>
                            <div>
                                <h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Color</h4>
                                <ColorPicker colors={routineColors} selectedColor={color} onSelectColor={setColor} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Navigation */}
                <footer className={`flex-shrink-0 flex items-center justify-between p-4 border-t border-white/10`}>
                    <button 
                        onClick={prevStep} 
                        aria-label="Previous Step"
                        className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${themeConfig.textColor} bg-transparent hover:bg-white/10 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        Back
                    </button>
                    <button 
                        onClick={currentStep < totalSteps ? nextStep : handleSave} 
                        aria-label={currentStep < totalSteps ? "Next Step" : (isEditMode ? 'Update Routine' : 'Save Routine')}
                        className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 bg-accent text-white hover:shadow-lg hover:shadow-accent/30`}
                    >
                        {currentStep < totalSteps ? 'Next' : (isEditMode ? 'Update Routine' : 'Save Routine')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddRoutineModal;