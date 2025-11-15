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
    tasks: { id: number; text: string; budget?: number }[];
    notifications: {
        enabled: boolean;
        notifyBefore: number; // in minutes
        notifyAtStart: boolean;
        notifyAtEnd: boolean;
    };
}

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  memberIds: number[];
}


// --- Permissions ---
export const permissionNames = [
  'manageMembers',
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