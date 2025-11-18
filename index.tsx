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
import { AppDataProvider } from './contexts/AppDataContext';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <DeviceProvider>
        <ToastProvider>
          <AppDataProvider>
            <AuthProvider>
              <ThemeProvider>
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
              </ThemeProvider>
            </AuthProvider>
          </AppDataProvider>
        </ToastProvider>
      </DeviceProvider>
    </ErrorBoundary>
  </React.StrictMode>
);