import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Metric {
    value: number;
    label: string;
    icon?: React.ReactNode;
}

const MetricItem: React.FC<Metric> = ({ value, label, icon }) => {
    const { themeConfig } = useTheme();
    // Detailed view with icon
    if (icon) {
        return (
             <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-black/20 ${themeConfig.subtextColor}`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-xl font-bold ${themeConfig.textColor}`}>{value}</p>
                    <p className={`text-xs font-medium uppercase tracking-wider ${themeConfig.subtextColor}`}>{label}</p>
                </div>
            </div>
        );
    }
    // Compact view without icon
    return (
        <div className="text-center p-2">
            <p className={`text-xl font-bold ${themeConfig.textColor}`}>{value}</p>
            <p className={`text-xs font-medium uppercase tracking-wider ${themeConfig.subtextColor}`}>{label}</p>
        </div>
    );
};


interface SummaryMetricsProps {
    mainMetrics: Metric[];
    expandedMetrics: Metric[];
}

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
    mainMetrics,
    expandedMetrics,
}) => {
    const { themeConfig } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full max-w-3xl mx-auto mb-3 p-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5">
            <div className="flex items-center">
                <div className="flex-grow grid grid-cols-3 divide-x divide-white/10">
                    {mainMetrics.map(metric => (
                        <MetricItem key={metric.label} value={metric.value} label={metric.label} />
                    ))}
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className={`p-3 rounded-full hover:bg-white/10 transition-colors ${themeConfig.textColor}`}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse metrics' : 'Expand metrics'}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-2 pt-3 border-t border-white/10' : 'max-h-0'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-1">
                    {expandedMetrics.map(metric => (
                        <MetricItem 
                            key={metric.label}
                            value={metric.value}
                            label={metric.label}
                            icon={metric.icon}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SummaryMetrics;