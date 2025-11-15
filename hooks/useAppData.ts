import { useCallback } from 'react';
import { useMemberContext } from '../contexts/MemberContext';
import { useRoutineContext } from '../contexts/RoutineContext';
import { useTeamContext } from '../contexts/TeamContext';
import { useEventContext } from '../contexts/EventContext';
import { sampleData } from '../config/sampleData';
import { validateImportData } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';

export const useAppData = () => {
    const { members, setMembers } = useMemberContext();
    const { routines, setRoutines } = useRoutineContext();
    const { teams, setTeams } = useTeamContext();
    const { events, setEvents } = useEventContext();
    const { addToast } = useToast();

    const loadSampleData = useCallback((skipConfirmation = false) => {
        const confirmed = skipConfirmation || window.confirm('This will replace all current data. Are you sure?');
        if (confirmed) {
            setTeams(sampleData.teams);
            setMembers(sampleData.members);
            setRoutines(sampleData.routines);
            setEvents(sampleData.events);
            if (!skipConfirmation) {
              addToast('Sample data loaded!', 'success');
            }
        }
    }, [setTeams, setMembers, setRoutines, setEvents, addToast]);

    const importData = useCallback((jsonString: string) => {
        if (!window.confirm('This will replace all current data with the imported data. Are you sure?')) {
            return;
        }
        try {
            const data = JSON.parse(jsonString);
            const validationError = validateImportData(data);
            if (validationError) {
                throw new Error(validationError);
            }
            if (data.teams) setTeams(data.teams);
            if (data.members) setMembers(data.members);
            if (data.routines) setRoutines(data.routines);
            if (data.events) setEvents(data.events);
            addToast('Data imported successfully!', 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid JSON file.';
            addToast(message, 'error');
            console.error("Failed to import data:", error);
        }
    }, [setTeams, setMembers, setRoutines, setEvents, addToast]);
    
    const exportData = useCallback((selection: { [key: string]: boolean }) => {
        const dataToExport: { [key: string]: any } = {};
        if (selection.teams) dataToExport.teams = teams;
        if (selection.members) dataToExport.members = members;
        if (selection.routines) dataToExport.routines = routines;
        if (selection.events) dataToExport.events = events;

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "beyond-time-data.json";
        link.click();
    }, [teams, members, routines, events]);

    const deleteMemberAndRoutines = useCallback((memberId: number) => {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        setRoutines(prev => prev.filter(r => r.memberId !== memberId));
        addToast('Member and their routines have been deleted.', 'success');
    }, [setMembers, setRoutines, addToast]);

    return { loadSampleData, importData, exportData, deleteMemberAndRoutines };
};
