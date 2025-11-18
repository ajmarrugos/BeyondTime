import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ToggleSwitch from '../forms/ToggleSwitch';
import ExpandableSection from '../ui/ExpandableSection';
import { useAppData } from '../../contexts/AppDataContext';

const IntegrationsDataView: React.FC = () => {
    const { themeConfig } = useTheme();
    const { loadSampleData, importData, exportData } = useAppData();
    const dataFileInputRef = useRef<HTMLInputElement>(null);

    const [exportSelection, setExportSelection] = useState({
        teams: true, members: true, routines: true, events: true,
    });
    const [n8nEnabled, setN8nEnabled] = useState(false);

    const handleExportSelectionChange = (key: keyof typeof exportSelection) => {
        setExportSelection(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleExportClick = () => exportData(exportSelection);
    const handleImportClick = () => dataFileInputRef.current?.click();

    const handleDataFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    importData(content);
                }
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    };
    
    return (
        <div className="overflow-y-auto h-full space-y-4">
            <ExpandableSection title="Data Management" defaultOpen={true}>
                <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Load, import, or export your application data.</p>
                <div className="space-y-2">
                    <button onClick={() => loadSampleData()} className={`w-full p-3 rounded-xl font-semibold text-center ${themeConfig.textColor} bg-white/5 hover:bg-white/10 transition-colors`}>Load Sample Data</button>
                    <button onClick={handleImportClick} className={`w-full p-3 rounded-xl font-semibold text-center ${themeConfig.textColor} bg-white/5 hover:bg-white/10 transition-colors`}>Import from JSON</button>
                    <input type="file" ref={dataFileInputRef} onChange={handleDataFileChange} accept=".json" className="hidden" />
                </div>
                <div className="mt-4">
                    <h4 className={`font-medium mb-2 ${themeConfig.textColor}`}>Export Options</h4>
                    <div className="space-y-2 p-3 rounded-xl bg-black/10">
                        {Object.keys(exportSelection).map(key => (
                            <label key={key} className="flex items-center justify-between">
                                <span className={`capitalize ${themeConfig.textColor}`}>{key}</span>
                                <input type="checkbox" checked={exportSelection[key as keyof typeof exportSelection]} onChange={() => handleExportSelectionChange(key as keyof typeof exportSelection)} className="form-checkbox h-5 w-5 rounded bg-white/10 border-white/20 text-accent focus:ring-accent" />
                            </label>
                        ))}
                    </div>
                    <button onClick={handleExportClick} className={`w-full mt-3 p-3 rounded-xl font-semibold text-center text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-shadow`}>Export to JSON</button>
                </div>
            </ExpandableSection>

            <ExpandableSection title="Integrations">
                <p className={`text-sm mb-3 ${themeConfig.subtextColor}`}>Connect to external services.</p>
                <div className="space-y-3">
                    <ToggleSwitch label="n8n Assistant Webhook" enabled={n8nEnabled} setEnabled={setN8nEnabled} />
                    <input type="text" placeholder="Enter webhook URL..." disabled={!n8nEnabled} className={`w-full p-3 rounded-xl bg-black/10 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-opacity disabled:opacity-50`} />
                </div>
            </ExpandableSection>
            
            <ExpandableSection title="API Key">
                <label className={`font-medium ${themeConfig.textColor}`}>Web API Key</label>
                <div className="flex space-x-2 mt-2">
                    <input type="text" readOnly value="********************" className={`flex-grow p-3 rounded-xl bg-black/10 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none cursor-not-allowed`} />
                   <button className={`px-4 rounded-xl font-semibold ${themeConfig.textColor} bg-white/10 hover:bg-white/20 transition-colors`}>Copy</button>
                </div>
            </ExpandableSection>
        </div>
    );
};

export default React.memo(IntegrationsDataView);