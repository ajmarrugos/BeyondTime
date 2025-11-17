import React, { useState, useMemo } from 'react';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import ClockDisplay from '../ui/ClockDisplay'; // New Component
import ViewSwitcher from '../ui/ViewSwitcher';
import { Routine } from '../../types';

type SubView = 'clock' | 'weekly' | 'monthly';

interface ClockViewProps {
    showGlow?: boolean;
    routines: Routine[];
    onItemClick: (routine: Routine) => void;
}

const ClockView: React.FC<ClockViewProps> = (props) => {
    const [activeSubView, setActiveSubView] = useState<SubView>('clock');

    const switcherOptions = useMemo(() => [
        { label: 'Today', value: 'clock' as SubView },
        { label: 'Week', value: 'weekly' as SubView },
        { label: 'Month', value: 'monthly' as SubView },
    ], []);

    return (
        <div className="w-full h-full flex flex-col items-center z-10 p-6 pt-0">
            <div className="w-full flex-1 flex flex-col items-center justify-start overflow-y-auto pt-8">
                {activeSubView === 'clock' && <ClockDisplay {...props} />}
                {activeSubView === 'weekly' && <WeeklyView routines={props.routines} />}
                {activeSubView === 'monthly' && <MonthlyView routines={props.routines} />}
            </div>
            <footer className="w-full flex-shrink-0 pt-4">
                <ViewSwitcher 
                    label="Clock View Type"
                    options={switcherOptions}
                    selectedValue={activeSubView}
                    onChange={(value) => setActiveSubView(value)}
                />
            </footer>
        </div>
    );
};

export default ClockView;