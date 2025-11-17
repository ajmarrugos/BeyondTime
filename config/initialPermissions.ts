
import { PermissionsModel } from '../types';

export const initialPermissions: PermissionsModel = {
  Admin: {
    manageMembers: 'All',
    manageTeams: 'All',
    manageRoutines: 'Self',
    viewRoutines: 'All',
    viewIntegrations: 'All',
    managePermissions: 'All',
  },
  Owner: {
    manageMembers: 'Team',
    manageTeams: 'All',
    manageRoutines: 'Self',
    viewRoutines: 'Team',
    viewIntegrations: 'None',
    managePermissions: 'None',
  },
  Member: {
    manageMembers: 'None',
    manageTeams: 'None',
    manageRoutines: 'Self',
    viewRoutines: 'Self',
    viewIntegrations: 'None',
    managePermissions: 'None',
  },
};