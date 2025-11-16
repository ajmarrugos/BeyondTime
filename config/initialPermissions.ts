import { PermissionsModel } from '../types';

export const initialPermissions: PermissionsModel = {
  Admin: {
    manageMembers: 'All',
    manageRoutines: 'Self',
    viewRoutines: 'All',
    viewIntegrations: 'All',
    managePermissions: 'All',
  },
  Owner: {
    manageMembers: 'Team',
    manageRoutines: 'Self',
    viewRoutines: 'Team',
    viewIntegrations: 'None',
    managePermissions: 'None',
  },
  Member: {
    manageMembers: 'None',
    manageRoutines: 'Self',
    viewRoutines: 'Self',
    viewIntegrations: 'None',
    managePermissions: 'None',
  },
};