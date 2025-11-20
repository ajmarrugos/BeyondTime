
import { Member, Routine, Team } from "../types";

// Sample data has been de-implemented in favor of webhook-based data fetching.
// The application now requires connection to the n8n backend to load initial data.

export const sampleData: {
  teams: Team[];
  members: Member[];
  routines: Routine[];
} = {
  teams: [],
  members: [],
  routines: [],
};
