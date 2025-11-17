import { useState, useEffect, useCallback } from 'react';

const routes = ['routines', 'clock', 'tasks'];

export const useHashRouter = (defaultViewIndex: number) => {
    const getIndexFromHash = useCallback(() => {
        const hash = window.location.hash.replace('#/', '');
        const index = routes.indexOf(hash);
        return index === -1 ? defaultViewIndex : index;
    }, [defaultViewIndex]);

    const [currentView, setCurrentView] = useState(getIndexFromHash);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentView(getIndexFromHash());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [getIndexFromHash]);

    const navigate = useCallback((index: number) => {
        const currentPath = routes[getIndexFromHash()];
        const newPath = routes[index];
        if (newPath && currentPath !== newPath) {
            window.location.hash = `/${newPath}`;
        }
    }, [getIndexFromHash]);

    // Set initial hash if not present or invalid
    useEffect(() => {
        const hash = window.location.hash.replace('#/', '');
        if (!hash || !routes.includes(hash)) {
            window.location.hash = `/${routes[defaultViewIndex]}`;
        }
    }, [defaultViewIndex]);

    return { currentView, navigate };
};