


import React, { useCallback, useRef, useEffect, memo, useState, useMemo } from 'react';

// Hooks
import { useDevice } from './contexts/DeviceContext';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { usePermissions } from './hooks/usePermissions';
import { useModal } from './contexts/ModalContext';
import { useSettingsPanel } from './contexts/SettingsPanelContext';
import { useDragState } from './contexts/DragStateContext';
import usePersistentState from './hooks/usePersistentState';


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


// Config
import { blobConfigurations } from './config/blobs';
import { SCROLL_THROTTLE_MS } from './config/constants';
import { Routine } from './types';

// Memoized Views for performance
const MemoRoutinesView = memo(RoutinesView);
const MemoClockView = memo(ClockView);
const MemoTasksView = memo(TasksView);


// --- Main App Component ---

const App: React.FC = () => {
  const { themeConfig } = useTheme();
  const { currentUser } = useAuth();
  const { getVisibleRoutines, canViewSettingsPanel } = usePermissions();
  const {
    isRoutineModalMounted, isRoutineModalOpen, closeRoutineModal, handleRoutineModalExited,
    isConfirmModalOpen, confirmModalProps, handleConfirm, handleCancelConfirm,
    isRoutineDetailModalOpen, detailRoutine, openRoutineDetailModal, closeRoutineDetailModal,
  } = useModal();
  const { isSettingsOpen, openSettings, closeSettings } = useSettingsPanel();
  const { isDraggingRoutine } = useDragState();
 
  // View state and scroll handling
  const [currentView, setCurrentView] = useState(1); // 0:Routines, 1:Clock, 2:Tasks
  const appRef = useRef<HTMLElement>(null);
  const lastScrollTime = useRef(0);
  
  const device = useDevice();
  const viewCount = 3;
  
  const visibleRoutines = getVisibleRoutines();

  // Split routines into two categories for the different views
  const routinesAndEvents = useMemo(() => 
      visibleRoutines.filter(r => r.tags.includes('Routine') || r.tags.includes('Event')), 
      [visibleRoutines]
  );
  const tasksAndPayments = useMemo(() => 
      visibleRoutines.filter(r => r.tags.includes('Task') || r.tags.includes('Payment')),
      [visibleRoutines]
  );

  // Clock glow effect state
  const [showClockGlow, setShowClockGlow] = useState(false);

  // State for completed tasks, lifted from RoutinesView to be shared
  const [completedTasks, setCompletedTasks] = usePersistentState<Record<number, number[]>>('completedTasks', {});

  const handleToggleTask = useCallback((routineId: number, taskId: number) => {
    setCompletedTasks(prev => {
        const newCompletedState = { ...prev };
        const completedTasksForRoutine = new Set(newCompletedState[routineId] || []);

        if (completedTasksForRoutine.has(taskId)) {
            completedTasksForRoutine.delete(taskId);
        } else {
            completedTasksForRoutine.add(taskId);
        }

        if (completedTasksForRoutine.size === 0) {
            delete newCompletedState[routineId];
        } else {
            newCompletedState[routineId] = Array.from(completedTasksForRoutine);
        }

        return newCompletedState;
    });
  }, [setCompletedTasks]);

  const handleSetView = useCallback((viewIndex: number) => {
    setCurrentView(viewIndex);
  }, []);

  const handleLogoClick = useCallback(() => {
    handleSetView(1); // 1 is the clock view
    setShowClockGlow(true);
  }, [handleSetView]);

  const handleItemClick = useCallback((routine: Routine) => {
    openRoutineDetailModal(routine);
  }, [openRoutineDetailModal]);

  useEffect(() => {
    if (showClockGlow) {
        // Reset the glow effect after the animation finishes (1.5s)
        const timer = setTimeout(() => setShowClockGlow(false), 1500);
        return () => clearTimeout(timer);
    }
  }, [showClockGlow]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!device.isDesktop || isRoutineModalOpen || isSettingsOpen) return;

      const now = Date.now();
      // Throttle scroll events to prevent rapid view changes
      if (now - lastScrollTime.current < SCROLL_THROTTLE_MS) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0) { // Scrolling down
        if (currentView < viewCount - 1) {
          handleSetView(currentView + 1);
          lastScrollTime.current = now;
        }
      } else { // Scrolling up
        if (currentView > 0) {
          handleSetView(currentView - 1);
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
  }, [currentView, device.isDesktop, handleSetView, viewCount, isRoutineModalOpen, isSettingsOpen]);

  // Effect to prevent body scroll when modals are open
  useEffect(() => {
    if (isSettingsOpen || isRoutineModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSettingsOpen, isRoutineModalOpen]);

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
                <button onClick={handleLogoClick} aria-label="Go to Clock View">
                  <Logo className={`h-10 w-10 ${themeConfig.textColor} transition-transform hover:scale-110`} />
                </button>
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
                onViewChange={handleSetView}
                isInteractionDisabled={isRoutineModalOpen || isSettingsOpen}
            >
                <section className="w-full h-full flex-shrink-0">
                  <MemoRoutinesView 
                    routines={routinesAndEvents}
                    completedTasks={completedTasks}
                    onToggleTask={handleToggleTask}
                  />
                </section>
                <section className="w-full h-full flex-shrink-0">
                    <MemoClockView 
                        showGlow={showClockGlow} 
                        routines={routinesAndEvents}
                        onItemClick={handleItemClick}
                    />
                </section>
                <section className="w-full h-full flex-shrink-0">
                  <MemoTasksView
                    routines={tasksAndPayments}
                    completedTasks={completedTasks}
                    onToggleTask={handleToggleTask}
                  />
                </section>
            </SwipeableLayout>
            
            {/* Footer with View Indicator */}
            <footer className="flex-shrink-0 h-12 flex items-center justify-center">
              <ViewIndicator 
                viewCount={viewCount} 
                currentView={currentView} 
                onIndicatorClick={handleSetView} 
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
                completedTasks={completedTasks}
                onToggleTask={handleToggleTask}
            />
          )}
        </>
      )}
    </main>
  );
};

export default App;