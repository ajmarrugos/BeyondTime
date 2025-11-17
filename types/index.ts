
export interface Team {
  id: number;
  name: string;
}

export type Role = 'Admin' | 'Owner' | 'Member';

export interface Member {
  id: number;
  name: string;
  teamId?: number;
  role: Role;
  password?: string; // Should be handled securely in a real app
  phone?: string;
  timezone?: string;
  shareData?: boolean;
}

// Fix: Extracted Task into its own interface to make it reusable and exportable.
export interface Task {
  id: number;
  text: string;
  budget?: number;
}

export interface Routine {
    id: number;
    name: string;
    memberId: number;
    description: string;
    tags: string[];
    color: string;
    icon: string;
    autoLive: boolean;
    repetition: 'Daily' | 'Weekly' | 'Monthly' | 'Annually' | 'None';
    weekdays?: number[];
    monthDays?: number[];
    annualDates?: string[];
    startTime: string;
    endTime: string;
    tasks: Task[];
    budget?: number; // For unitary payments
    notifications: {
        enabled: boolean;
        notifyBefore: number; // in minutes
        notifyAtStart: boolean;
        notifyAtEnd: boolean;
    };
}

// --- Permissions ---
export const permissionNames = [
  'manageMembers',
  'manageTeams',
  'manageRoutines',
  'viewRoutines',
  'viewIntegrations',
  'managePermissions',
] as const;

export type PermissionName = typeof permissionNames[number];

export type PermissionScope = 'None' | 'Self' | 'Team' | 'All';

export type PermissionSet = {
  [key in PermissionName]?: PermissionScope;
};

export type PermissionsModel = {
  [key in Role]: PermissionSet;
};