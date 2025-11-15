import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface TaskListProps {
    tasks: { id: number; text: string; budget?: number }[];
    setTasks: (tasks: { id: number; text: string; budget?: number }[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks }) => {
    const { themeConfig } = useTheme();
    const [inputValue, setInputValue] = useState('');
    const [budget, setBudget] = useState('');
    const maxTasks = 10;

    const handleAddTask = () => {
        if (inputValue && tasks.length < maxTasks) {
            const newBudget = budget ? parseFloat(budget) : undefined;
            const newTask = { id: Date.now(), text: inputValue.trim(), budget: newBudget };
            setTasks([...tasks, newTask]);
            setInputValue('');
            setBudget('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTask();
        }
    };

    const handleRemoveTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const inputBaseStyle = `p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`;

    return (
        <div>
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tasks.length < maxTasks ? "Add a task..." : `Max ${maxTasks} tasks`}
                    disabled={tasks.length >= maxTasks}
                    className={`flex-grow ${inputBaseStyle}`}
                />
                 <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Budget ($)"
                    min="0"
                    step="0.01"
                    className={`w-28 ${inputBaseStyle}`}
                    disabled={tasks.length >= maxTasks}
                />
                <button 
                    onClick={handleAddTask} 
                    disabled={tasks.length >= maxTasks || !inputValue}
                    className={`px-4 rounded-xl font-semibold ${themeConfig.textColor} bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Add
                </button>
            </div>
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className={`flex items-center space-x-2 p-3 rounded-lg ${themeConfig.textColor} bg-black/20`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50 cursor-grab" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span className="flex-grow">{task.text}</span>
                        {task.budget !== undefined && (
                            <span className={`text-sm font-mono px-2 py-0.5 rounded-full bg-black/10 ${themeConfig.subtextColor}`}>
                                ${task.budget.toFixed(2)}
                            </span>
                        )}
                        <button onClick={() => handleRemoveTask(task.id)} className="p-1 rounded-full hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
                 {tasks.length === 0 && <p className={`text-center py-4 ${themeConfig.subtextColor}`}>No tasks added yet.</p>}
            </div>
        </div>
    );
};

export default TaskList;