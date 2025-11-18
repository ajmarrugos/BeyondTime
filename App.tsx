

import React, { useCallback, useRef, useEffect, memo, useState, useMemo } from 'react';

// Hooks
import { useDevice } from './contexts/DeviceContext';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { usePermissions } from './hooks/usePermissions';
import { useModal } from './contexts/ModalContext';
import { useSettingsPanel } from './contexts/SettingsPanelContext';
import { useDragState } from './contexts/DragStateContext';
import { useCurrentTime } from './hooks/useCurrentTime';
import { useAppData } from './contexts/AppDataContext';


// Components
import AnimatedBlob from './components/AnimatedBlob';
import SettingsPanel from './components/SettingsPanel';
import ViewIndicator from './components/ViewIndicator';
import ClockView from './components/views/ClockView';
import RoutinesView from './components/views/RoutinesView';
import TasksView from './components/views/TasksView';
import Logo from './components/Logo';
import AddRoutineModal from './components/modals/AddRoutineModal';
import LoginView from './components/views/LoginView';
import DeleteDropZone from './components/DeleteDropZone';
import ConfirmModal from './components/modals/ConfirmModal';
import SwipeableLayout from './components/SwipeableLayout';
import ToastContainer from './components/ToastContainer';
import NotificationManager from './components/NotificationManager';
import RoutineDetailModal from './components/modals/RoutineDetailModal';
import AddMemberModal from './components/modals/AddMemberModal';
import EditMemberModal from './components/modals/EditMemberModal';
import TeamSettingsModal from './components/modals/TeamSettingsModal';


// Config
import { blobConfigurations } from './config/blobs';
import { SCROLL_THROTTLE_MS } from './config/constants';
import { Routine } from './types';
import { ThemeName } from './config/themes';

// Memoized Views for performance
const MemoRoutinesView = memo(RoutinesView);
const MemoClockView = memo(ClockView);
const MemoTasksView = memo(TasksView);


// --- Main App Component ---

const App: React.FC = () => {
  const { themeConfig, handleThemeChange, currentTheme, timezone } = useTheme();
  const { currentUser } = useAuth();
  const { routines } = useAppData();
  const { canViewSettingsPanel } = usePermissions();
  const {
    isRoutineModalMounted, isRoutineModalOpen, closeRoutineModal, handleRoutineModalExited,
    isConfirmModalOpen, confirmModalProps, handleConfirm, handleCancelConfirm,
    isRoutineDetailModalOpen, detailRoutine, openRoutineDetailModal, closeRoutineDetailModal,
    isAddMemberModalOpen, closeAddMemberModal,
    isEditMemberModalOpen, closeEditMemberModal, memberToEdit,
    isTeamSettingsModalOpen, closeTeamSettingsModal,
  } = useModal();
  const { isSettingsOpen, openSettings, closeSettings } = useSettingsPanel();
  const { isDraggingRoutine } = useDragState();
 
  // View state is managed in-memory to avoid security errors in sandboxed environments
  const [currentView, navigate] = useState(1); // Default to clock view (index 1)
  const [clockViewKey, setClockViewKey] = useState(0);
  const appRef = useRef<HTMLElement>(null);
  const lastScrollTime = useRef(0);
  
  const device = useDevice();
  const viewCount = 3;
  
  // For the Clock view (Today, Week, Month), ONLY get routines for the current user
  const clockViewRoutines = useMemo(() => {
    if (!currentUser) return [];
    return routines.filter(r => r.memberId === currentUser.id);
  }, [routines, currentUser]);

  // Routines & Events for the clock view (current user only)
  const routinesAndEventsForClockView = useMemo(() =>
      clockViewRoutines.filter(r => r.tags.includes('Routine') || r.tags.includes('Event')),
      [clockViewRoutines]
  );

  // Clock glow effect state
  const [showClockGlow, setShowClockGlow] = useState(false);
  
  // Sleep Mode State
  const [isSleepModeActive, setIsSleepModeActive] = useState(false);
  const originalThemeRef = useRef<ThemeName | null>(null);
  const currentTime = useCurrentTime();

  const anyModalOpen = isSettingsOpen || isRoutineModalOpen || isAddMemberModalOpen || isEditMemberModalOpen || isTeamSettingsModalOpen || isRoutineDetailModalOpen || isConfirmModalOpen;

  const handleLogoClick = useCallback(() => {
    navigate(1); // Switch to the clock view.
    setClockViewKey(k => k + 1); // Force remount to reset its internal state (e.g. from 'weekly' back to 'clock').
    setShowClockGlow(true);
  }, [navigate]);

  const handleItemClick = useCallback((routine: Routine) => {
    openRoutineDetailModal(routine);
  }, [openRoutineDetailModal]);

    // Effect for Sleep Mode Detection
    useEffect(() => {
        const sleepTags = ['sleep', 'rest', 'nap', 'lay down'];

        const activeSleepRoutine = routinesAndEventsForClockView.find(routine => {
            const hasSleepTag = routine.tags.some(tag => sleepTags.includes(tag.toLowerCase()));
            if (!hasSleepTag) return false;

            const timeInTimezone = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
            const nowInMinutes = timeInTimezone.getHours() * 60 + timeInTimezone.getMinutes();

            const [startHour, startMinute] = routine.startTime.split(':').map(Number);
            const startTimeInMinutes = startHour * 60 + startMinute;

            const [endHour, endMinute] = routine.endTime.split(':').map(Number);
            let endTimeInMinutes = endHour * 60 + endMinute;

            // Handle overnight schedules (e.g., 22:00 to 06:00)
            if (endTimeInMinutes <= startTimeInMinutes) {
                return nowInMinutes >= startTimeInMinutes || nowInMinutes < endTimeInMinutes;
            }
            
            // Handle same-day schedules
            return nowInMinutes >= startTimeInMinutes && nowInMinutes < endTimeInMinutes;
        });

        setIsSleepModeActive(!!activeSleepRoutine);
    }, [currentTime, routinesAndEventsForClockView, timezone]);

    // Effect for Theme Switching based on Sleep Mode
    useEffect(() => {
        if (isSleepModeActive) {
            if (currentTheme !== 'moon') {
                originalThemeRef.current = currentTheme;
                handleThemeChange('moon');
            }
        } else {
            if (originalThemeRef.current && currentTheme === 'moon') {
                handleThemeChange(originalThemeRef.current);
                originalThemeRef.current = null; // Clear ref after restoring
            }
        }
    }, [isSleepModeActive, currentTheme, handleThemeChange]);


  useEffect(() => {
    if (showClockGlow) {
        // Reset the glow effect after the animation finishes (1.5s)
        const timer = setTimeout(() => setShowClockGlow(false), 1500);
        return () => clearTimeout(timer);
    }
  }, [showClockGlow]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!device.isDesktop || anyModalOpen) return;

      const now = Date.now();
      // Throttle scroll events to prevent rapid view changes
      if (now - lastScrollTime.current < SCROLL_THROTTLE_MS) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0) { // Scrolling down
        if (currentView < viewCount - 1) {
          navigate(currentView + 1);
          lastScrollTime.current = now;
        }
      } else { // Scrolling up
        if (currentView > 0) {
          navigate(currentView - 1);
          lastScrollTime.current = now;
        }
      }
    };

    const mainElement = appRef.current;
    if (mainElement) {
        // use passive: false to allow preventDefault
        mainElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
        if (mainElement) {
            mainElement.removeEventListener('wheel', handleWheel);
        }
    };
  }, [currentView, device.isDesktop, navigate, viewCount, anyModalOpen]);

  // Effect to prevent body scroll when modals are open
  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [anyModalOpen]);

  return (
    <main 
      ref={appRef}
      className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${themeConfig.background}`} 
      aria-label="Interactive lava lamp background"
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0">
        {blobConfigurations.map((config, index) => (
          <AnimatedBlob 
            key={index} 
            {...config} 
            color={themeConfig.blobColors[index % themeConfig.blobColors.length]} 
          />
        ))}
      </div>

      {!currentUser ? (
        <LoginView />
      ) : (
        <>
          <NotificationManager />
          <ToastContainer />
          {/* Main Layout Container */}
          <div className="relative z-10 flex flex-col w-full h-full">
            {/* Header */}
            <header className="flex-shrink-0 pt-4 px-6 md:pt-6 md:px-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button onClick={handleLogoClick} aria-label="Go to Clock View">
                    <Logo className={`h-10 w-10 ${themeConfig.textColor} transition-transform hover:scale-110`} />
                  </button>
                  {isSleepModeActive && (
                      <div title="Sleep Mode Active" style={{ animation: 'sleep-pulse 2.5s ease-in-out infinite' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${themeConfig.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                      </div>
                  )}
                </div>
                {canViewSettingsPanel() && (
                  <button
                      onClick={openSettings}
                      aria-label="Open settings"
                      className={`p-2 rounded-full transition-colors duration-200 hover:bg-white/10 ${themeConfig.textColor}`}
                  >
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  </button>
                )}
            </header>
            
            {/* Swipeable Content Area */}
            <SwipeableLayout
                currentView={currentView}
                viewCount={viewCount}
                onViewChange={navigate}
                isInteractionDisabled={anyModalOpen}
            >
                <section className="w-full h-full flex-shrink-0">
                  <MemoRoutinesView />
                </section>
                <section className="w-full h-full flex-shrink-0">
                    <MemoClockView 
                        key={clockViewKey}
                        showGlow={showClockGlow} 
                        routines={routinesAndEventsForClockView}
                        onItemClick={handleItemClick}
                    />
                </section>
                <section className="w-full h-full flex-shrink-0">
                  {/* FIX: Removed props as the component now fetches its own data */}
                  <MemoTasksView />
                </section>
            </SwipeableLayout>
            
            {/* Footer with View Indicator */}
            <footer className="flex-shrink-0 h-12 flex items-center justify-center">
              <ViewIndicator 
                viewCount={viewCount} 
                currentView={currentView} 
                onIndicatorClick={navigate} 
              />
            </footer>
          </div>
          
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={closeSettings}
          />

          <DeleteDropZone 
            isDragging={isDraggingRoutine}
          />

          {isRoutineModalMounted && (
            <AddRoutineModal
                isOpen={isRoutineModalOpen}
                onClose={closeRoutineModal}
                onExited={handleRoutineModalExited}
            />
          )}

          {confirmModalProps && (
            <ConfirmModal
              isOpen={isConfirmModalOpen}
              title={confirmModalProps.title}
              message={confirmModalProps.message}
              onConfirm={handleConfirm}
              onCancel={handleCancelConfirm}
              confirmText={confirmModalProps.confirmText}
              cancelText={confirmModalProps.cancelText}
            />
          )}
          
          {isRoutineDetailModalOpen && detailRoutine && (
            <RoutineDetailModal
                isOpen={isRoutineDetailModalOpen}
                onClose={closeRoutineDetailModal}
                routine={detailRoutine}
            />
          )}

          <AddMemberModal 
            isOpen={isAddMemberModalOpen}
            onClose={closeAddMemberModal}
          />
          <EditMemberModal 
            isOpen={isEditMemberModalOpen}
            onClose={closeEditMemberModal}
            member={memberToEdit}
          />
          <TeamSettingsModal
            isOpen={isTeamSettingsModalOpen}
            onClose={closeTeamSettingsModal}
          />
        </>
      )}
    </main>
  );
};

export default App;