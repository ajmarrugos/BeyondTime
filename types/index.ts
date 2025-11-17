import { ThemeName } from "../config/themes";

export interface Team {
  id: number;
  name: string;
}

export type Role = 'Admin' | 'Owner' | 'Member';

// --- Personalization ---
export type ClockLayout = 'luxury' | 'minimalist' | 'digital' | 'pro';
export type StartOfWeek = 'sunday' | 'monday';
export interface ClockEffects {
    sweepingSecondHand: boolean;
    parallax: boolean;
    glint: boolean;
}
export interface PersonalizationSettings {
    theme: ThemeName;
    accentColor: string;
    clockLayout: ClockLayout;
    clockEffects: ClockEffects;
    startOfWeek: StartOfWeek;
    animationSpeed: number;
}


export interface Member {
  id: number;
  name: string;
  teamId?: number;
  role: Role;
  password?: string; // Should be handled securely in a real app
  phone?: string;
  timezone?: string;
  shareData?: boolean;
  personalization?: PersonalizationSettings;
}

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