

import { Member, Routine, Team } from "../types";

export const sampleData: {
  teams: Team[];
  members: Member[];
  routines: Routine[];
} = {
  teams: [
    { "id": 1, "name": "Family" },
    { "id": 2, "name": "Work" }
  ],
  members: [
    { "id": 1, "name": "Alex", "teamId": 1, "role": "Owner", "password": "password" },
    { "id": 2, "name": "Jamie", "teamId": 1, "role": "Member", "password": "password" },
    { "id": 3, "name": "Sam", "teamId": 2, "role": "Admin", "password": "password" }
  ],
  routines: [
    // --- Tasks ---
    {
      "id": 301,
      "name": "Website Redesign Project",
      "memberId": 3,
      "description": "Complete the final phase of the website redesign, including QA and deployment. Key deliverables: Finalize UI/UX testing, run migration scripts, deploy to production.",
      "tags": ["Task", "work", "project-phoenix"],
      "color": "#14b8a6",
      "icon": "M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15ZM4 22V15",
      "autoLive": false,
      "repetition": "Annually",
      "annualDates": ["2024-09-30"],
      "startTime": "00:00",
      "endTime": "00:00",
      "tasks": [],
      "notifications": {
        "enabled": true,
        "notifyBefore": 1440,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    // --- Payments ---
    {
      "id": 302,
      "name": "Monthly Rent",
      "memberId": 1,
      "description": "Payment for apartment rent.",
      "tags": ["Payment", "bills", "finance", "critical"],
      "color": "#84cc16",
      "icon": "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zm5 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 6h12v11H6V6z",
      "autoLive": false,
      "repetition": "Annually",
      "annualDates": ["2024-09-01"],
      "startTime": "00:00",
      "endTime": "00:00",
      "budget": 1850.00,
      "tasks": [],
      "notifications": {
        "enabled": true,
        "notifyBefore": 2880,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    // --- Events ---
    {
      "id": 201,
      "name": "Project Deadline",
      "memberId": 3,
      "description": "Final submission for Project Phoenix.",
      "tags": ["Event", "work", "deadline"],
      "color": "#d946ef",
      "icon": "M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15ZM12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z",
      "autoLive": false,
      "repetition": "Annually",
      "annualDates": ["2024-09-15"],
      "startTime": "17:00",
      "endTime": "18:00",
      "tasks": [],
      "notifications": {
        "enabled": true,
        "notifyBefore": 1440,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    {
      "id": 202,
      "name": "Jamie's Birthday",
      "memberId": 2,
      "description": "Birthday celebration at home.",
      "tags": ["Event", "family", "social"],
      "color": "#ec4899",
      "icon": "M20 12V20H4V12M20 8H4L12 12L20 8ZM12 4H15C16.1046 4 17 4.89543 17 6C17 7.10457 16.1046 8 15 8H9C7.89543 8 7 7.10457 7 6C7 4.89543 7.89543 4 9 4H12Z",
      "autoLive": false,
      "repetition": "Annually",
      "annualDates": ["2024-10-02"],
      "startTime": "18:00",
      "endTime": "22:00",
      "tasks": [],
      "notifications": {
        "enabled": true,
        "notifyBefore": 1440,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    // --- Routines ---
    {
      "id": 101,
      "name": "Morning Standup",
      "memberId": 3,
      "description": "Daily sync with the work team.",
      "tags": ["Routine", "work", "meeting"],
      "color": "#3b82f6",
      "icon": "M14 6V4C14 2.89543 13.1046 2 12 2H10C8.89543 2 8 2.89543 8 4V6H4V20H20V6H14ZM10 4H12V6H10V4Z",
      "autoLive": true,
      "repetition": "Weekly",
      "weekdays": [1, 2, 3, 4, 5],
      "startTime": "09:00",
      "endTime": "09:15",
      "tasks": [
        { "id": 1, "text": "Share yesterday's progress" },
        { "id": 2, "text": "Outline today's plan" },
        { "id": 3, "text": "Mention any blockers" }
      ],
      "notifications": {
        "enabled": true,
        "notifyBefore": 5,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    {
      "id": 102,
      "name": "Family Dinner",
      "memberId": 1,
      "description": "Dinner together with the family.",
      "tags": ["Routine", "family", "social"],
      "color": "#f97316",
      "icon": "M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z",
      "autoLive": false,
      "repetition": "Daily",
      "startTime": "19:00",
      "endTime": "20:00",
      "tasks": [
        { "id": 1, "text": "Buy groceries", "budget": 45.50 },
        { "id": 2, "text": "Set the table" },
        { "id": 3, "text": "Help with cleanup" }
      ],
      "notifications": {
        "enabled": true,
        "notifyBefore": 30,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    {
      "id": 103,
      "name": "Morning Server Health Check",
      "memberId": 3,
      "description": "Daily review of server logs, performance metrics, and backup status.",
      "tags": ["Routine", "servers", "monitoring", "daily"],
      "color": "#0ea5e9",
      "icon": "M3 12H5V21H3V12ZM19 8H21V21H19V8ZM11 4H13V21H11V4Z",
      "autoLive": true,
      "repetition": "Weekly",
      "weekdays": [1, 2, 3, 4, 5],
      "startTime": "08:30",
      "endTime": "09:30",
      "tasks": [
        { "id": 1, "text": "Check system monitoring dashboards" },
        { "id": 2, "text": "Review overnight backup completion logs" },
        { "id": 3, "text": "Scan for critical security alerts" },
        { "id": 4, "text": "Check for any new support tickets" }
      ],
      "notifications": {
        "enabled": true,
        "notifyBefore": 5,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    {
      "id": 104,
      "name": "Patch Management",
      "memberId": 3,
      "description": "Apply and test OS and application security patches.",
      "tags": ["Routine", "security", "updates", "maintenance"],
      "color": "#f43f5e",
      "icon": "M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM14.1213 9.87868L10.5858 13.4142L9.87868 14.1213L13.4142 10.5858L14.1213 9.87868Z",
      "autoLive": false,
      "repetition": "Weekly",
      "weekdays": [2],
      "startTime": "14:00",
      "endTime": "16:00",
      "tasks": [
        { "id": 1, "text": "Review vendor patch releases" },
        { "id": 2, "text": "Deploy patches to staging environment" },
        { "id": 3, "text": "Run automated tests on staging" },
        { "id": 4, "text": "Schedule production deployment", "budget": 250 }
      ],
      "notifications": {
        "enabled": false,
        "notifyBefore": 15,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    },
    {
      "id": 105,
      "name": "Weekly Backup Verification",
      "memberId": 3,
      "description": "Perform a test restore from a recent backup to ensure data integrity.",
      "tags": ["Routine", "backups", "disaster-recovery", "critical"],
      "color": "#10b981",
      "icon": "M16 18L22 12L16 6M8 6L2 12L8 18",
      "autoLive": false,
      "repetition": "Weekly",
      "weekdays": [5],
      "startTime": "11:00",
      "endTime": "12:00",
      "tasks": [
        { "id": 1, "text": "Select a random server for test restore" },
        { "id": 2, "text": "Initiate restore to an isolated environment" },
        { "id": 3, "text": "Verify file and data integrity" },
        { "id": 4, "text": "Document the successful test" }
      ],
      "notifications": {
        "enabled": true,
        "notifyBefore": 10,
        "notifyAtStart": true,
        "notifyAtEnd": true
      }
    },
    {
      "id": 106,
      "name": "EOD Status Report",
      "memberId": 3,
      "description": "Summarize daily activities, resolved tickets, and outstanding issues.",
      "tags": ["Routine", "reporting", "communication"],
      "color": "#a1a1aa",
      "icon": "M12 6.25278C12 6.25278 14.9388 4 18.375 4C21.8112 4 22.5 6.25278 22.5 6.25278V19.5106C22.5 19.5106 21.8112 21.7634 18.375 21.7634C14.9388 21.7634 12 19.5106 12 19.5106M12 6.25278C12 6.25278 9.06122 4 5.625 4C2.18878 4 1.5 6.25278 1.5 6.25278V19.5106C1.5 19.5106 2.18878 21.7634 5.625 21.7634C9.06122 21.7634 12 19.5106 12 19.5106M12 6.25278V19.5106",
      "autoLive": false,
      "repetition": "Weekly",
      "weekdays": [1, 2, 3, 4, 5],
      "startTime": "16:30",
      "endTime": "17:00",
      "tasks": [
        { "id": 1, "text": "Update ticket statuses in Jira/ServiceNow" },
        { "id": 2, "text": "Draft EOD summary email" },
        { "id": 3, "text": "Check monitoring for new alerts before sign-off" }
      ],
      "notifications": {
        "enabled": true,
        "notifyBefore": 0,
        "notifyAtStart": false,
        "notifyAtEnd": true
      }
    },
    {
      "id": 107,
      "name": "Monthly Maintenance",
      "memberId": 3,
      "description": "In-depth system maintenance, including server reboots and hardware checks.",
      "tags": ["Routine", "maintenance", "downtime", "planning"],
      "color": "#a855f7",
      "icon": "M14.5 13.0625L10.9375 9.5M10.9375 9.5L9.5 10.9375M10.9375 9.5C10.9375 9.5 13.0625 2 22 2C22 10.9375 14.5 13.0625 14.5 13.0625ZM14.5 13.0625C14.5 13.0625 13.0625 14.5 9.5 14.5C5.9375 14.5 2 22 2 22C10.9375 22 14.5 13.0625 14.5 13.0625Z",
      "autoLive": false,
      "repetition": "Monthly",
      "monthDays": [15],
      "startTime": "22:00",
      "endTime": "23:59",
      "tasks": [
        { "id": 1, "text": "Send maintenance notification to users" },
        { "id": 2, "text": "Perform rolling reboots of clustered services" },
        { "id": 3, "text": "Run hardware diagnostics" },
        { "id": 4, "text": "Purchase new monitoring tool license", "budget": 1200 }
      ],
      "notifications": {
        "enabled": true,
        "notifyBefore": 1440,
        "notifyAtStart": true,
        "notifyAtEnd": false
      }
    }
  ]
};