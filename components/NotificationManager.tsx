import { useEffect, useRef } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useRoutineContext } from '../contexts/RoutineContext';
import { usePermissions } from '../hooks/usePermissions';
import { Routine } from '../types';

const NotificationManager: React.FC = () => {
    const { notificationsEnabled, permissionStatus } = useNotificationContext();
    const { getVisibleRoutines } = usePermissions();
    const routines = getVisibleRoutines();
    const notifiedEventsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!notificationsEnabled || permissionStatus !== 'granted') {
            return;
        }

        const checkAndNotify = () => {
            const now = new Date();
            const currentDay = now.getDay();
            const currentDate = now.getDate();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            routines.forEach((routine: Routine) => {
                if (!routine.notifications.enabled) {
                    return;
                }

                // Check if the routine is scheduled for today
                let isScheduledToday = false;
                switch (routine.repetition) {
                    case 'Daily': isScheduledToday = true; break;
                    case 'Weekly': isScheduledToday = routine.weekdays?.includes(currentDay) ?? false; break;
                    case 'Monthly': isScheduledToday = routine.monthDays?.includes(currentDate) ?? false; break;
                    case 'Annually': isScheduledToday = routine.annualDates?.includes(todayISO) ?? false; break;
                    default: break;
                }

                if (!isScheduledToday) {
                    return;
                }

                const [startHour, startMinute] = routine.startTime.split(':').map(Number);
                const startTime = startHour * 60 + startMinute;

                const [endHour, endMinute] = routine.endTime.split(':').map(Number);
                const endTime = endHour * 60 + endMinute;

                const notify = (title: string, body: string) => {
                    new Notification(title, {
                        body,
                        icon: '/logo.png', // Assuming a logo is available at this path
                    });
                };

                // Check for 'before' notification
                const beforeTime = startTime - routine.notifications.notifyBefore;
                if (routine.notifications.notifyBefore > 0 && currentTime === beforeTime) {
                    const eventId = `${routine.id}-before-${todayISO}`;
                    if (!notifiedEventsRef.current.has(eventId)) {
                        notify(routine.name, `Starts in ${routine.notifications.notifyBefore} minutes.`);
                        notifiedEventsRef.current.add(eventId);
                    }
                }

                // Check for 'start' notification
                if (routine.notifications.notifyAtStart && currentTime === startTime) {
                    const eventId = `${routine.id}-start-${todayISO}`;
                    if (!notifiedEventsRef.current.has(eventId)) {
                        notify(routine.name, `It's time to start this routine.`);
                        notifiedEventsRef.current.add(eventId);
                    }
                }

                // Check for 'end' notification
                if (routine.notifications.notifyAtEnd && currentTime === endTime) {
                    const eventId = `${routine.id}-end-${todayISO}`;
                    if (!notifiedEventsRef.current.has(eventId)) {
                        notify(routine.name, `This routine has now ended.`);
                        notifiedEventsRef.current.add(eventId);
                    }
                }
            });
        };

        // Run the check every minute
        const intervalId = setInterval(checkAndNotify, 60000);

        // Also run it once on startup
        checkAndNotify();

        return () => {
            clearInterval(intervalId);
        };

    }, [routines, notificationsEnabled, permissionStatus]);

    return null; // This component does not render anything
};

export default NotificationManager;
