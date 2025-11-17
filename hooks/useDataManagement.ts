import { useCallback } from 'react';
import { useMembers } from '../contexts/MembersContext';
import { useRoutines } from '../contexts/RoutinesContext';
import { useToast } from '../contexts/ToastContext';
import { sampleData } from '../config/sampleData';
import { validateImportData } from '../utils/validation';

export const useDataManagement = () => {
    const { members, setMembers, teams, setTeams } = useMembers();
    const { routines, setRoutines } = useRoutines();
    const { addToast } = useToast();

    const deleteMemberAndRoutines = useCallback((memberId: number) => {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        setRoutines(prev => prev.filter(r => r.memberId !== memberId));
        addToast('Member and their items have been deleted.', 'success');
    }, [setMembers, setRoutines, addToast]);
    
    const loadSampleData = useCallback((skipConfirmation = false) => {
        const confirmed = skipConfirmation || window.confirm('This will replace all current data. Are you sure?');
        if (confirmed) {
            setTeams(sampleData.teams);
            setMembers(sampleData.members);
            setRoutines(sampleData.routines);
            if (!skipConfirmation) {
              addToast('Sample data loaded!', 'success');
            }
        }
    }, [setTeams, setMembers, setRoutines, addToast]);

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
            setTeams(data.teams || []);
            setMembers(data.members || []);
            setRoutines(data.routines || []);
            addToast('Data imported successfully!', 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid JSON file.';
            addToast(message, 'error');
            console.error("Failed to import data:", error);
        }
    }, [setTeams, setMembers, setRoutines, addToast]);
    
    const exportData = useCallback((selection: { [key: string]: boolean }) => {
        const dataToExport: { [key: string]: any } = {};
        if (selection.teams) dataToExport.teams = teams;
        if (selection.members) dataToExport.members = members;
        
        const routinesToExport = routines.filter(r => 
            (selection.routines && (r.tags.includes('Routine') || r.tags.includes('Task') || r.tags.includes('Payment'))) ||
            (selection.events && r.tags.includes('Event'))
        );
        dataToExport.routines = routinesToExport;

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "beyond-time-data.json";
        link.click();
    }, [teams, members, routines]);

    return {
        loadSampleData,
        importData,
        exportData,
        deleteMemberAndRoutines,
    };
};