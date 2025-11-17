import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../Logo';

const InfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
    const { themeConfig } = useTheme();
    return (
        <div className={`flex justify-between items-center py-3 border-b border-white/10 ${themeConfig.textColor}`}>
            <span className={`font-medium ${themeConfig.subtextColor}`}>{label}</span>
            <span className="text-right">{children}</span>
        </div>
    );
};

const AboutView: React.FC = () => {
    const { themeConfig } = useTheme();
    
    const appVersion = '2.5.0';
    const developerName = '@ajmarrugos';
    const developerLink = 'https://github.com/ajmarrugos';
    const projectName = 'BeyondTime';
    const githubLink = 'https://github.com/ajmarrugos/BeyondTime';
    const supportEmail = 'ajmarrugos@gmail.com';
    const supportText = 'Support';

    return (
        <div className="flex flex-col h-full items-center text-center">
            <Logo className={`w-20 h-20 ${themeConfig.textColor} mt-4 mb-2`} />
            <h3 className={`text-2xl font-bold ${themeConfig.textColor}`}>BeyondTime</h3>
            <p className={`${themeConfig.subtextColor} mb-6`}>Manage your life, beautifully.</p>

            <div className="w-full max-w-xs text-sm">
                <InfoItem label="Version">{appVersion}</InfoItem>
                <InfoItem label="Developer">
                    <a href={developerLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {developerName}
                    </a>
                </InfoItem>
                <InfoItem label="Project code">
                    <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {projectName}
                    </a>
                </InfoItem>
                <InfoItem label="Report an Issue">
                    <a href={`${githubLink}/issues`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        GitHub Issues
                    </a>
                </InfoItem>
                <InfoItem label="Support contact">
                    <a href={`mailto:${supportEmail}`} className="text-accent hover:underline">
                        {supportText}
                    </a>
                </InfoItem>
            </div>

            <p className={`mt-auto text-xs ${themeConfig.subtextColor}`}>
                &copy; {new Date().getFullYear()} BeyondTime. All Rights Reserved.
            </p>
        </div>
    );
};

export default AboutView;