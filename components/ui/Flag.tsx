import React from 'react';

interface FlagProps {
    countryCode: string;
    className?: string;
}

const Flag: React.FC<FlagProps> = ({ countryCode, className = 'w-4 h-4' }) => {
    if (!countryCode) return null;

    return (
        <img
            src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
            alt={`${countryCode} flag`}
            className={`${className} rounded-sm object-cover`}
            loading="lazy"
        />
    );
};

export default Flag;
