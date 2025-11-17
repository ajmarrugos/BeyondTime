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
import { NotificationProvider } from './contexts/NotificationContext';
import { MembersProvider } from './contexts/MembersContext';
import { RoutinesProvider } from './contexts/RoutinesContext';


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
          <ToastProvider>
            <MembersProvider>
              <AuthProvider>
                <RoutinesProvider>
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
                </RoutinesProvider>
              </AuthProvider>
            </MembersProvider>
          </ToastProvider>
        </ThemeProvider>
      </DeviceProvider>
    </ErrorBoundary>
  </React.StrictMode>
);