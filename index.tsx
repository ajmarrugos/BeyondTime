import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DeviceProvider } from './contexts/DeviceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { DeviceMotionProvider } from './contexts/DeviceMotionContext';
import { ModalProvider } from './contexts/ModalContext';
import { SettingsPanelProvider } from './contexts/SettingsPanelContext';
import { DragStateProvider } from './contexts/DragStateContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { MemberProvider } from './contexts/MemberContext';
import { RoutineProvider } from './contexts/RoutineContext';
import { TeamProvider } from './contexts/TeamContext';
import { EventProvider } from './contexts/EventContext';
import { NotificationProvider } from './contexts/NotificationContext';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <DeviceProvider>
        <ThemeProvider>
          <TeamProvider>
            <EventProvider>
              <MemberProvider>
                <RoutineProvider>
                  <AuthProvider>
                    <ToastProvider>
                      <NotificationProvider>
                        <SettingsPanelProvider>
                          <ModalProvider>
                            <DragStateProvider>
                              <PermissionsProvider>
                                <DeviceMotionProvider>
                                  <App />
                                </DeviceMotionProvider>
                              </PermissionsProvider>
                            </DragStateProvider>
                          </ModalProvider>
                        </SettingsPanelProvider>
                      </NotificationProvider>
                    </ToastProvider>
                  </AuthProvider>
                </RoutineProvider>
              </MemberProvider>
            </EventProvider>
          </TeamProvider>
        </ThemeProvider>
      </DeviceProvider>
    </ErrorBoundary>
  </React.StrictMode>
);