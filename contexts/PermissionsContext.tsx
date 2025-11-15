import React, { createContext, useContext, useMemo, useCallback, useRef, useEffect } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { PermissionsModel } from '../types';
import { initialPermissions } from '../config/initialPermissions';

interface PermissionsContextType {
  permissions: PermissionsModel;
  commitPermissionChanges: (newPermissions: PermissionsModel) => Promise<void>;
  setPermissions: (permissions: PermissionsModel) => void;
  refreshPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = usePersistentState<PermissionsModel>('permissions', initialPermissions);
  const originalPermissionsRef = useRef<PermissionsModel>(permissions);

  useEffect(() => {
    originalPermissionsRef.current = permissions;
  }, [permissions]);


  const commitPermissionChanges = useCallback(async (newPermissions: PermissionsModel) => {
    // Optimistically update the UI
    setPermissions(newPermissions);

    try {
        // Simulate an API call with a delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Simulate potential failure
        if (Math.random() > 0.8) { // 20% chance of failure
            throw new Error('Validation failed by the data administrator.');
        }
        // If successful, the new state is already set. We just update the original state ref.
        originalPermissionsRef.current = newPermissions;

    } catch (error) {
        // On failure, revert to the original state
        setPermissions(originalPermissionsRef.current);
        // Re-throw the error so the component can catch it and show a toast
        throw error;
    }
  }, [setPermissions]);
  
  const refreshPermissions = useCallback(() => {
    setPermissions(initialPermissions);
  }, [setPermissions]);

  const value = useMemo(() => ({
    permissions,
    commitPermissionChanges,
    setPermissions,
    refreshPermissions,
  }), [permissions, commitPermissionChanges, setPermissions, refreshPermissions]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsProvider');
  }
  return context;
};