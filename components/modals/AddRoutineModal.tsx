import React, { useReducer, useMemo, useEffect, useRef } from 'react';
import { routineColors, routineIcons } from '../../config/routineOptions';
import ColorPicker from '../forms/ColorPicker';
import IconPicker from '../forms/IconPicker';
import TagInput from '../forms/TagInput';
import ToggleSwitch from '../forms/ToggleSwitch';
import TaskList from '../forms/TaskList';
import { Routine, Task } from '../../types';
import WeekdaySelector from '../forms/WeekdaySelector';
import MonthdaySelector from '../forms/MonthdaySelector';
import AnnualDatePicker from '../forms/AnnualDatePicker';
import Stepper from '../forms/Stepper';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../contexts/ToastContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModal } from '../../contexts/ModalContext';
import { vibrate } from '../../utils/haptics';
import { useRoutines } from '../../contexts/RoutinesContext';

interface AddRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExited: () => void;
}

type ItemType = 'Routine' | 'Event' | 'Task' | 'Payment';

type FormState = Omit<Routine, 'id' | 'weekdays' | 'monthDays'> & {
    weekdays: Set<number>;
    monthDays: Set<number>;
};

type FormAction =
    | { type: 'SET_FIELD'; field: keyof Omit<FormState, 'tasks' | 'tags' | 'weekdays' | 'monthDays' | 'annualDates' | 'notifications'>; value: any }
    | { type: 'SET_TASKS'; payload: Task[] }
    | { type: 'SET_TAGS'; payload: string[] }
    | { type: 'TOGGLE_WEEKDAY'; payload: number }
    | { type: 'TOGGLE_MONTHDAY'; payload: number }
    | { type: 'SET_ANNUAL_DATES'; payload: string[] }
    | { type: 'SET_NOTIFICATION_FIELD'; field: keyof Routine['notifications']; value: any }
    | { type: 'RESET_FORM'; payload?: Routine | null };
    
type FormErrors = Partial<Record<keyof FormState | 'form' | 'repetitionDetails', string>>;


const initialState: FormState = {
    name: '', memberId: 0, description: '', tags: [], color: routineColors[0], icon: routineIcons[0], autoLive: false,
    repetition: 'Daily', startTime: '09:00', endTime: '10:00', tasks: [],
    weekdays: new Set(), monthDays: new Set(), annualDates: [],
    notifications: { enabled: true, notifyBefore: 5, notifyAtStart: true, notifyAtEnd: false },
    budget: undefined,
};

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'SET_TASKS':
            return { ...state, tasks: action.payload };
        case 'SET_TAGS':
            return { ...state, tags: action.payload };
        case 'TOGGLE_WEEKDAY': {
            const newSet = new Set(state.weekdays);
            if (newSet.has(action.payload)) newSet.delete(action.payload); else newSet.add(action.payload);
            return { ...state, weekdays: newSet };
        }
        case 'TOGGLE_MONTHDAY': {
            const newSet = new Set(state.monthDays);
            if (newSet.has(action.payload)) newSet.delete(action.payload); else newSet.add(action.payload);
            return { ...state, monthDays: newSet };
        }
        case 'SET_ANNUAL_DATES':
            return { ...state, annualDates: action.payload };
        case 'SET_NOTIFICATION_FIELD':
            return { ...state, notifications: { ...state.notifications, [action.field]: action.value } };
        case 'RESET_FORM': {
            const routineToEdit = action.payload;
            if (routineToEdit) {
                return {
                    ...initialState,
                    ...routineToEdit,
                    weekdays: new Set(routineToEdit.weekdays),
                    monthDays: new Set(routineToEdit.monthDays),
                    notifications: routineToEdit.notifications || initialState.notifications,
                };
            }
            return initialState;
        }
        default:
            return state;
    }
}

const AddRoutineModal: React.FC<AddRoutineModalProps> = ({ isOpen, onExited, ...props }) => {
    const { themeConfig } = useTheme();
    const { getAssignableMembers } = usePermissions();
    const { addRoutine, updateRoutine } = useRoutines();
    const { editingRoutine, preselectedMemberId } = useModal();
    const { addToast } = useToast();
    const availableMembers = getAssignableMembers();
    const isEditMode = !!editingRoutine;

    const [state, dispatch] = useReducer(formReducer, initialState);
    const [itemType, setItemType] = React.useState<ItemType>('Task');
    const [currentStep, setCurrentStep] = React.useState(1);
    const [errors, setErrors] = React.useState<FormErrors>({});
    
    const transitionRef = useRef<HTMLDivElement>(null);
    const modalRef = useFocusTrap(isOpen);
    
    useEffect(() => {
        if (isOpen) {
            dispatch({ type: 'RESET_FORM', payload: editingRoutine });
            if (editingRoutine) {
                if (editingRoutine.tags.includes('Task')) setItemType('Task');
                else if (editingRoutine.tags.includes('Payment')) setItemType('Payment');
                else if (editingRoutine.tags.includes('Event')) setItemType('Event');
                else setItemType('Routine');
            } else if (preselectedMemberId) {
                dispatch({ type: 'SET_FIELD', field: 'memberId', value: preselectedMemberId });
                setItemType('Task'); // Default to task when adding for a member
            } else {
                 setItemType('Task');
            }
            setErrors({});
        }
    }, [isOpen, editingRoutine, preselectedMemberId]);
    
    useEffect(() => {
        const isTaskOrPayment = itemType === 'Task' || itemType === 'Payment';
        const isEvent = itemType === 'Event';
        if (isTaskOrPayment || isEvent) {
            dispatch({ type: 'SET_FIELD', field: 'repetition', value: 'Annually' });
            dispatch({ type: 'SET_FIELD', field: 'autoLive', value: false });
        } else {
             dispatch({ type: 'SET_FIELD', field: 'repetition', value: 'Daily' });
        }
    }, [itemType]);
    
    useEffect(() => {
        const validate = () => {
            const newErrors: FormErrors = {};
            if (!state.name.trim()) newErrors.name = `${itemType} name is required.`;
            if (!state.memberId) newErrors.memberId = 'A member must be selected.';
            
            if (itemType === 'Routine' || itemType === 'Event') {
                const startTimeMinutes = parseInt(state.startTime.split(':')[0]) * 60 + parseInt(state.startTime.split(':')[1]);
                const endTimeMinutes = parseInt(state.endTime.split(':')[0]) * 60 + parseInt(state.endTime.split(':')[1]);
                 if (endTimeMinutes <= startTimeMinutes) {
                    newErrors.endTime = 'End time must be after start time for overnight routines.';
                }
            }

            if (itemType === 'Routine') {
                if (state.repetition === 'Weekly' && state.weekdays.size === 0) newErrors.repetitionDetails = 'Please select at least one day for weekly repetition.';
                if (state.repetition === 'Monthly' && state.monthDays.size === 0) newErrors.repetitionDetails = 'Please select at least one date for monthly repetition.';
                if (state.repetition === 'Annually' && state.annualDates.length === 0) newErrors.repetitionDetails = 'Please select at least one date for annual repetition.';
            } else { // Event, Task, Payment
                if (state.annualDates.length === 0) {
                    newErrors.repetitionDetails = `Please select a date for the ${itemType.toLowerCase()}.`;
                }
            }
            
            if (itemType === 'Payment') {
                if (state.budget === undefined || state.budget <= 0) {
                    newErrors.budget = 'A valid amount is required for a payment.';
                }
            }

            setErrors(newErrors);
        };
        validate();
    }, [state, itemType]);


    useEffect(() => {
        const node = transitionRef.current;
        if (!node) return;
        const handleTransitionEnd = (e: TransitionEvent) => {
            if (e.target === node && !isOpen) onExited();
        };
        node.addEventListener('transitionend', handleTransitionEnd);
        return () => node.removeEventListener('transitionend', handleTransitionEnd);
    }, [isOpen, onExited]);

    useEffect(() => {
        if (!isEditMode && !preselectedMemberId && availableMembers.length === 1) {
            dispatch({ type: 'SET_FIELD', field: 'memberId', value: availableMembers[0].id });
        }
    }, [availableMembers, isEditMode, preselectedMemberId]);
    

    const handleLocalClose = () => {
        props.onClose();
        setTimeout(() => {
            dispatch({ type: 'RESET_FORM' });
            setCurrentStep(1);
            setItemType('Task');
            setErrors({});
        }, 300); 
    };

    const handleSave = () => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            if (errors.name || errors.memberId) setCurrentStep(1);
            else if (errors.repetitionDetails || errors.startTime || errors.endTime) setCurrentStep(2);
            else if (errors.budget) setCurrentStep(3);
            addToast('Please fix the errors before saving.', 'warning');
            return;
        }

        const mandatoryTag = itemType;
        const otherTags = state.tags.filter(t => !['Routine', 'Event', 'Task', 'Payment'].includes(t));
        const finalTags = [mandatoryTag, ...otherTags];

        const isTimeRelevant = itemType === 'Routine' || itemType === 'Event';
        const isUnitary = itemType === 'Task' || itemType === 'Payment';

        const routineData: Omit<Routine, 'id'> = {
            name: state.name.trim(), memberId: state.memberId, description: state.description.trim(),
            tags: finalTags, color: state.color, icon: state.icon,
            autoLive: isTimeRelevant ? state.autoLive : false,
            repetition: isTimeRelevant && itemType === 'Routine' ? state.repetition : 'Annually',
            weekdays: state.repetition === 'Weekly' && itemType === 'Routine' ? [...state.weekdays].sort((a,b) => a-b) : undefined,
            monthDays: state.repetition === 'Monthly' && itemType === 'Routine' ? [...state.monthDays].sort((a,b) => a-b) : undefined,
            annualDates: (state.repetition === 'Annually' || isUnitary) ? state.annualDates.sort() : undefined,
            startTime: isTimeRelevant ? state.startTime : '00:00',
            endTime: isTimeRelevant ? state.endTime : '00:00',
            tasks: isUnitary ? [] : state.tasks,
            budget: itemType === 'Payment' ? state.budget : undefined,
            notifications: state.notifications,
        };

        if (isEditMode) {
            updateRoutine({ ...routineData, id: editingRoutine.id });
        } else {
            addRoutine(routineData);
        }
        vibrate();
        handleLocalClose();
    };

    const isCurrentStepInvalid = useMemo(() => {
        switch (currentStep) {
            case 1: return !!(errors.name || errors.memberId);
            case 2: return !!(errors.repetitionDetails || errors.startTime || errors.endTime);
            case 3: return !!(errors.budget);
            default: return false;
        }
    }, [currentStep, errors]);
    
    const stepsToShow = itemType === 'Task' || itemType === 'Payment' ? 3 : 4;

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, stepsToShow));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const steps = useMemo(() => {
        if (itemType === 'Task' || itemType === 'Payment') {
            return ['Info', 'Scheduling', 'Details'];
        }
        return ['Info', 'Scheduling', 'Tasks', 'Appearance'];
    }, [itemType]);

    const inputBaseStyle = `w-full p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2`;
    const getStepStyle = (step: number) => {
        if (step === currentStep) return 'translate-x-0 opacity-100';
        if (step < currentStep) return '-translate-x-full opacity-0 pointer-events-none';
        return 'translate-x-full opacity-0 pointer-events-none';
    };
    
    const displayTags = state.tags.filter(t => !['Routine', 'Event', 'Task', 'Payment'].includes(t));

    return (
        <div ref={transitionRef} className={`fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 transition-opacity duration-300 ease-in-out bg-black/40 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={(e) => { if (e.target === e.currentTarget) handleLocalClose(); }} aria-modal="true" role="dialog">
            <div ref={modalRef as React.RefObject<HTMLDivElement>} className={`flex flex-col w-full h-full overflow-hidden ${themeConfig.background} md:max-w-xl lg:max-w-2xl md:h-auto md:min-h-[640px] md:max-h-[90vh] md:rounded-3xl md:shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <header className={`flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10`}>
                    <button onClick={handleLocalClose} aria-label="Close" className={`p-2 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    <h2 className={`text-xl font-bold ${themeConfig.textColor}`}>{isEditMode ? 'Edit Item' : 'Create Item'}</h2>
                    <div className="w-10 h-10"></div>
                </header>
                <Stepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
                <div className="relative flex-1 overflow-y-auto min-h-0">
                    {/* --- STEP 1: Info --- */}
                    <div className={`absolute top-0 left-0 w-full h-full p-6 transition-all duration-300 ease-in-out ${getStepStyle(1)}`}>
                        <div className="max-w-md mx-auto space-y-4">
                            <div>
                                <label className={`block mb-2 font-medium ${themeConfig.textColor}`}>Type</label>
                                <div role="radiogroup" className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl border border-white/10 overflow-hidden bg-black/20 p-1">
                                    {([
                                        { type: 'Task', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
                                        { type: 'Payment', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
                                        { type: 'Event', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                                        { type: 'Routine', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> },
                                    ] as { type: ItemType, icon: React.ReactNode }[]).map(({ type, icon }) => (
                                        <button
                                            key={type}
                                            onClick={() => setItemType(type)}
                                            role="radio"
                                            aria-checked={itemType === type}
                                            className={`w-full py-2.5 px-2 rounded-lg text-sm font-medium text-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 flex items-center justify-center space-x-2 ${itemType === type ? `bg-accent text-white` : `${themeConfig.textColor} hover:bg-white/10`}`}
                                        >
                                            {icon}
                                            <span>{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <input type="text" placeholder={`${itemType} Name`} value={state.name} onChange={e => dispatch({type: 'SET_FIELD', field: 'name', value: e.target.value})} className={`${inputBaseStyle} ${errors.name ? 'border-red-500' : 'border-transparent focus:border-accent'}`} />
                                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div className="relative">
                                <select value={state.memberId} onChange={e => dispatch({type: 'SET_FIELD', field: 'memberId', value: Number(e.target.value)})} className={`${inputBaseStyle} appearance-none ${errors.memberId ? 'border-red-500' : 'border-transparent focus:border-accent'}`} disabled={!isEditMode && !!preselectedMemberId}>
                                    <option value="0">Select a member</option>
                                    {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                {errors.memberId && <p className="text-red-400 text-sm mt-1">{errors.memberId}</p>}
                            </div>
                            <textarea placeholder="Description (optional)" value={state.description} onChange={e => dispatch({type: 'SET_FIELD', field: 'description', value: e.target.value})} className={`${inputBaseStyle} h-32 resize-none border-transparent focus:border-accent`} />
                        </div>
                    </div>
                    {/* --- STEP 2: Scheduling --- */}
                    <div className={`absolute top-0 left-0 w-full h-full p-6 transition-all duration-300 ease-in-out ${getStepStyle(2)}`}>
                        <div className="max-w-md mx-auto space-y-4">
                           {itemType === 'Routine' && <ToggleSwitch label="Auto-Live" enabled={state.autoLive} setEnabled={val => dispatch({type: 'SET_FIELD', field: 'autoLive', value: val})} />}
                           
                           {itemType === 'Routine' ? (
                                <div className="relative">
                                    <label htmlFor="repetition" className={`block mb-2 font-medium ${themeConfig.textColor}`}>Repetition</label>
                                    <select id="repetition" value={state.repetition} onChange={e => dispatch({type: 'SET_FIELD', field: 'repetition', value: e.target.value as Routine['repetition']})} className={`${inputBaseStyle} appearance-none border-transparent focus:border-accent`}>
                                    {['None', 'Daily', 'Weekly', 'Monthly', 'Annually'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <div className={`pointer-events-none absolute bottom-3 right-0 flex items-center px-3 ${themeConfig.textColor}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
                                </div>
                            ) : (
                                <div>
                                    <label className={`block mb-2 font-medium ${themeConfig.textColor}`}>{itemType === 'Event' ? 'Date(s)' : 'Due Date'}</label>
                                    <AnnualDatePicker 
                                        dates={state.annualDates} 
                                        setDates={dates => dispatch({ type: 'SET_ANNUAL_DATES', payload: itemType === 'Event' ? dates : (dates.length > 0 ? [dates[dates.length - 1]] : []) })} 
                                    />
                                </div>
                            )}

                           {state.repetition === 'Weekly' && itemType === 'Routine' && <WeekdaySelector selectedDays={state.weekdays} onDayToggle={day => dispatch({ type: 'TOGGLE_WEEKDAY', payload: day })} />}
                           {state.repetition === 'Monthly' && itemType === 'Routine' && <MonthdaySelector selectedDays={state.monthDays} onDayToggle={day => dispatch({ type: 'TOGGLE_MONTHDAY', payload: day })} />}
                           {state.repetition === 'Annually' && itemType === 'Routine' && <AnnualDatePicker dates={state.annualDates} setDates={dates => dispatch({ type: 'SET_ANNUAL_DATES', payload: dates })} />}
                           {errors.repetitionDetails && <p className="text-red-400 text-sm mt-1">{errors.repetitionDetails}</p>}
                           
                           {(itemType === 'Routine' || itemType === 'Event') && (
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label htmlFor="start-time" className={`block mb-2 font-medium ${themeConfig.textColor}`}>Start Time</label>
                                        <input type="time" id="start-time" value={state.startTime} onChange={e => dispatch({type: 'SET_FIELD', field: 'startTime', value: e.target.value})} className={`${inputBaseStyle} ${errors.startTime ? 'border-red-500' : 'border-transparent focus:border-accent'}`} />
                                        {errors.startTime && <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="end-time" className={`block mb-2 font-medium ${themeConfig.textColor}`}>End Time</label>
                                        <input type="time" id="end-time" value={state.endTime} onChange={e => dispatch({type: 'SET_FIELD', field: 'endTime', value: e.target.value})} className={`${inputBaseStyle} ${errors.endTime ? 'border-red-500' : 'border-transparent focus:border-accent'}`} />
                                        {errors.endTime && <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>}
                                    </div>
                                </div>
                           )}

                            <div className="pt-2">
                                <h4 className={`text-lg font-semibold mb-2 ${themeConfig.textColor}`}>Notifications</h4>
                                <div className="p-4 rounded-xl bg-black/20 space-y-4">
                                    <ToggleSwitch label="Enable Notifications" enabled={state.notifications.enabled} setEnabled={val => dispatch({type: 'SET_NOTIFICATION_FIELD', field: 'enabled', value: val})} />
                                    <div className={`transition-opacity duration-300 ${!state.notifications.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="flex items-center justify-between"><label className={`font-medium ${themeConfig.textColor}`}>Notify Before</label><div className="flex items-center space-x-2"><input type="number" value={state.notifications.notifyBefore} onChange={e => dispatch({type: 'SET_NOTIFICATION_FIELD', field: 'notifyBefore', value: parseInt(e.target.value, 10) || 0})} min="0" className={`w-20 p-2 rounded-lg bg-black/20 ${themeConfig.textColor} text-center focus:outline-none focus:ring-2 focus:ring-accent`} /><span className={`${themeConfig.subtextColor}`}>minutes</span></div></div>
                                        {(itemType === 'Routine' || itemType === 'Event') && (
                                            <>
                                                <ToggleSwitch label="Notify at Start Time" enabled={state.notifications.notifyAtStart} setEnabled={val => dispatch({type: 'SET_NOTIFICATION_FIELD', field: 'notifyAtStart', value: val})} />
                                                <ToggleSwitch label="Notify at End Time" enabled={state.notifications.notifyAtEnd} setEnabled={val => dispatch({type: 'SET_NOTIFICATION_FIELD', field: 'notifyAtEnd', value: val})} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                     {/* --- STEP 3: Tasks/Details --- */}
                    <div className={`absolute top-0 left-0 w-full h-full p-6 transition-all duration-300 ease-in-out ${getStepStyle(3)}`}>
                        <div className="max-w-md mx-auto space-y-4">
                            {(itemType === 'Routine' || itemType === 'Event') && 
                                <div><h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Tasks</h4><TaskList tasks={state.tasks} setTasks={tasks => dispatch({ type: 'SET_TASKS', payload: tasks })} /></div>
                            }
                            {itemType === 'Payment' &&
                                <div>
                                    <label htmlFor="payment-amount" className={`block mb-2 font-medium ${themeConfig.textColor}`}>Amount</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">$</span>
                                        <input type="number" id="payment-amount" placeholder="0.00" value={state.budget || ''} onChange={e => dispatch({type: 'SET_FIELD', field: 'budget', value: parseFloat(e.target.value) || undefined})} min="0" step="0.01" className={`${inputBaseStyle} pl-8 ${errors.budget ? 'border-red-500' : 'border-transparent focus:border-accent'}`} />
                                    </div>
                                    {errors.budget && <p className="text-red-400 text-sm mt-1">{errors.budget}</p>}
                                </div>
                            }
                            <div><h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Tags</h4><TagInput tags={displayTags} setTags={tags => dispatch({ type: 'SET_TAGS', payload: tags })} /></div>
                        </div>
                    </div>
                     {/* --- STEP 4: Appearance (Routines/Events only) --- */}
                    {(itemType === 'Routine' || itemType === 'Event') &&
                        <div className={`absolute top-0 left-0 w-full h-full p-6 transition-all duration-300 ease-in-out ${getStepStyle(4)}`}>
                            <div className="max-w-md mx-auto space-y-4">
                                <div><h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Icon</h4><IconPicker icons={routineIcons} selectedIcon={state.icon} onSelectIcon={icon => dispatch({type: 'SET_FIELD', field: 'icon', value: icon})} /></div>
                                <div><h4 className={`mb-3 font-medium ${themeConfig.textColor}`}>Color</h4><ColorPicker colors={routineColors} selectedColor={state.color} onSelectColor={color => dispatch({type: 'SET_FIELD', field: 'color', value: color})} /></div>
                            </div>
                        </div>
                    }
                </div>
                <footer className={`flex-shrink-0 flex items-center justify-between p-4 border-t border-white/10`}>
                    <button onClick={prevStep} aria-label="Previous Step" className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${themeConfig.textColor} bg-transparent hover:bg-white/10 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>Back</button>
                    <button onClick={currentStep < stepsToShow ? nextStep : handleSave} disabled={isCurrentStepInvalid} aria-label={currentStep < stepsToShow ? "Next Step" : (isEditMode ? 'Update Item' : 'Save Item')} className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 bg-accent text-white hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {currentStep < stepsToShow ? 'Next' : (isEditMode ? 'Update Item' : 'Save Item')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddRoutineModal;