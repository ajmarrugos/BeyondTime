
import { useState, useEffect } from 'react';

const getDeviceType = (width: number) => {
    if (width <= 768) {
        return { isMobile: true, isTablet: false, isDesktop: false };
    }
    if (width <= 1024) {
        return { isMobile: false, isTablet: true, isDesktop: false };
    }
    return { isMobile: false, isTablet: false, isDesktop: true };
};

const useDeviceType = () => {
    const [deviceType, setDeviceType] = useState(() => getDeviceType(window.innerWidth));

    useEffect(() => {
        const handleResize = () => {
            setDeviceType(getDeviceType(window.innerWidth));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceType;
};

export default useDeviceType;
