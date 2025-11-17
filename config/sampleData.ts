import { Member, Routine, Team } from "../types";

export const sampleData: {
  teams: Team[];
  members: Member[];
  routines: Routine[];
} = {
  teams: [
    { id: 10, name: "Executive" },
    { id: 20, name: "Engineering" },
    { id: 30, name: "Marketing" },
    { id: 40, name: "Design" },
  ],
  members: [
    // Executive Team
    { id: 1, name: "Alex Chen", teamId: 10, role: "Owner", password: "password", phone: "+1-202-555-0101", timezone: "America/New_York", shareData: true },
    { id: 2, name: "Brenda Vance", teamId: 10, role: "Admin", password: "password", phone: "+1-310-555-0102", timezone: "America/Los_Angeles", shareData: true },
    
    // Engineering Team
    { id: 3, name: "Charlie Davis", teamId: 20, role: "Member", password: "password", phone: "+44-20-7946-0103", timezone: "Europe/London", shareData: true },
    { id: 4, name: "Diana Smith", teamId: 20, role: "Member", password: "password", phone: "+33-1-2345-6789", timezone: "Europe/Paris", shareData: true },
    { id: 5, name: "Ethan Garcia", teamId: 20, role: "Member", password: "password", phone: "+1-512-555-0105", timezone: "America/Chicago", shareData: true },

    // Marketing Team
    { id: 6, name: "Fiona White", teamId: 30, role: "Member", password: "password", phone: "+81-3-1234-5678", timezone: "Asia/Tokyo", shareData: true },
    { id: 7, name: "George King", teamId: 30, role: "Member", password: "password", phone: "+61-2-9876-5432", timezone: "Australia/Sydney", shareData: true },

    // Design Team
    { id: 8, name: "Hannah Scott", teamId: 40, role: "Member", password: "password", phone: "+1-416-555-0108", timezone: "America/Toronto", shareData: true },
    { id: 9, name: "Ivan Petrov", teamId: 40, role: "Member", password: "password", phone: "+49-30-555-0109", timezone: "Europe/Berlin", shareData: true },

    // Unassigned
    { id: 10, name: "Julia Roberts", role: "Member", password: "password", phone: "+91-22-555-0110", timezone: "Asia/Kolkata", shareData: false },
  ],
  routines: [
    // --- HOLIDAYS & BIRTHDAYS (EVENTS) ---
    { id: 1, name: "New Year's Day", memberId: 1, description: "Company-wide holiday.", tags: ["Event", "Holiday"], color: "#ef4444", icon: "M20 12V20H4V12M20 8H4L12 12L20 8ZM12 4H15C16.1046 4 17 4.89543 17 6C17 7.10457 16.1046 8 15 8H9C7.89543 8 7 7.10457 7 6C7 4.89543 7.89543 4 9 4H12Z", autoLive: false, repetition: "Annually", annualDates: [`${new Date().getFullYear()}-01-01`], startTime: "00:00", endTime: "23:59", tasks: [], notifications: { enabled: false, notifyBefore: 0, notifyAtStart: false, notifyAtEnd: false } },
    { id: 2, name: "Charlie's Birthday", memberId: 3, description: "Happy Birthday Charlie!", tags: ["Event", "Birthday"], color: "#ec4899", icon: "M20 12V20H4V12M20 8H4L12 12L20 8ZM12 4H15C16.1046 4 17 4.89543 17 6C17 7.10457 16.1046 8 15 8H9C7.89543 8 7 7.10457 7 6C7 4.89543 7.89543 4 9 4H12Z", autoLive: false, repetition: "Annually", annualDates: [`${new Date().getFullYear()}-05-20`], startTime: "00:00", endTime: "23:59", tasks: [], notifications: { enabled: true, notifyBefore: 1440, notifyAtStart: false, notifyAtEnd: false } },
    { id: 3, name: "Summer Holiday", memberId: 1, description: "Company-wide summer break.", tags: ["Event", "Holiday"], color: "#f59e0b", icon: "M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17ZM12 21V23M12 1V3M21 12H23M1 12H3M18.36 5.64L19.78 4.22M4.22 19.78L5.64 18.36M18.36 18.36L19.78 19.78M4.22 4.22L5.64 5.64", autoLive: false, repetition: "Annually", annualDates: [`${new Date().getFullYear()}-08-15`], startTime: "00:00", endTime: "23:59", tasks: [], notifications: { enabled: false, notifyBefore: 0, notifyAtStart: false, notifyAtEnd: false } },

    // --- TEAM ROUTINES ---
    ...[3,4,5].map(id => ({ id: 100+id, name: "Engineering Standup", memberId: id, description: "Daily sync for the engineering team.", tags: ["Routine", "Work", "Meeting"], color: "#3b82f6", icon: "M16 18L22 12L16 6M8 6L2 12L8 18", autoLive: true, repetition: "Weekly", weekdays: [1, 2, 3, 4, 5], startTime: id === 5 ? "09:00" : "10:00", endTime: id === 5 ? "09:15" : "10:15", tasks: [], notifications: { enabled: true, notifyBefore: 5, notifyAtStart: true, notifyAtEnd: false } })),
    ...[6,7].map(id => ({ id: 100+id, name: "Marketing Sync", memberId: id, description: "Weekly marketing team sync.", tags: ["Routine", "Work", "Meeting"], color: "#d946ef", icon: "M3 12H5V21H3V12ZM19 8H21V21H19V8ZM11 4H13V21H11V4Z", autoLive: true, repetition: "Weekly", weekdays: [1, 4], startTime: "11:00", endTime: "11:45", tasks: [], notifications: { enabled: true, notifyBefore: 10, notifyAtStart: true, notifyAtEnd: false } })),
    ...[8,9].map(id => ({ id: 100+id, name: "Design Critique", memberId: id, description: "Bi-weekly design review.", tags: ["Routine", "Work", "Meeting"], color: "#a855f7", icon: "M12 21.0001C16.9706 21.0001 21 16.9706 21 12.0001C21 7.02951 16.9706 3.00006 12 3.00006C7.02944 3.00006 3 7.02951 3 12.0001C3 16.9706 7.02944 21.0001 12 21.0001ZM11 7.00006C8.79086 7.00006 7 8.79092 7 11.0001C7 12.3138 7.6631 13.4682 8.68344 14.2384C8.76182 14.3005 8.79093 14.394 8.75621 14.4754L8.04289 16.0355C7.99478 16.1432 8.05191 16.2625 8.1633 16.293L11.5355 17.293C11.6469 17.3235 11.758 17.262 11.7927 17.1506L13.8353 11.0001L14 10.0001C14 8.3432 12.6569 7.00006 11 7.00006Z", autoLive: true, repetition: "Weekly", weekdays: [2, 4], startTime: "14:00", endTime: "15:00", tasks: [], notifications: { enabled: true, notifyBefore: 10, notifyAtStart: true, notifyAtEnd: false } })),
    
    // --- INDIVIDUAL WORK & PERSONAL ROUTINES ---
    // Alex (Owner)
    { id: 201, name: "Executive Sync", memberId: 1, description: "Daily high-level planning.", tags: ["Routine", "Work"], color: "#14b8a6", icon: "M14 6V4C14 2.89543 13.1046 2 12 2H10C8.89543 2 8 2.89543 8 4V6H4V20H20V6H14ZM10 4H12V6H10V4Z", autoLive: true, repetition: "Weekly", weekdays: [1,2,3,4,5], startTime: "09:00", endTime: "09:30", tasks: [], notifications: { enabled: true, notifyBefore: 5, notifyAtStart: true, notifyAtEnd: false } },
    { id: 202, name: "Gym Session", memberId: 1, description: "Morning workout.", tags: ["Routine", "Health", "Personal"], color: "#f97316", icon: "M21 8H17.4857C17.2148 8 17 8.22386 17 8.5V15.5C17 15.7761 17.2148 16 17.4857 16H21V18H3V16H6.51429C6.78523 16 7 15.7761 7 15.5V8.5C7 8.22386 6.78523 8 6.51429 8H3V6H21V8ZM15 10H9V14H15V10Z", autoLive: true, repetition: "Weekly", weekdays: [1,3,5], startTime: "07:30", endTime: "08:30", tasks: [], notifications: { enabled: true, notifyBefore: 15, notifyAtStart: true, notifyAtEnd: false } },
    // Brenda (Admin)
    { id: 203, name: "Process Payroll", memberId: 2, description: "Monthly payroll processing.", tags: ["Routine", "Work", "Finance"], color: "#22c55e", icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zm5 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 6h12v11H6V6z", autoLive: false, repetition: "Monthly", monthDays: [28], startTime: "14:00", endTime: "16:00", tasks: [], notifications: { enabled: true, notifyBefore: 60, notifyAtStart: true, notifyAtEnd: false } },
    { id: 204, name: "Yoga", memberId: 2, description: "Evening yoga session.", tags: ["Routine", "Health", "Personal"], color: "#a855f7", icon: "M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z", autoLive: true, repetition: "Weekly", weekdays: [2,4], startTime: "19:00", endTime: "20:00", tasks: [], notifications: { enabled: true, notifyBefore: 10, notifyAtStart: true, notifyAtEnd: false } },
    // Charlie (Eng)
    { id: 205, name: "Focus Block: Backend API", memberId: 3, description: "Dedicated time for API development.", tags: ["Routine", "Work", "Deep Work"], color: "#3b82f6", icon: "M16 18L22 12L16 6M8 6L2 12L8 18", autoLive: true, repetition: "Weekly", weekdays: [1,2,3,4,5], startTime: "10:30", endTime: "12:30", tasks: [{id: 1, text: "Implement auth endpoint"}, {id: 2, text: "Write unit tests"}], notifications: { enabled: true, notifyBefore: 5, notifyAtStart: true, notifyAtEnd: false } },
    // Fiona (Marketing)
    { id: 206, name: "Content Creation", memberId: 6, description: "Write blog posts and social media content.", tags: ["Routine", "Work", "Creative"], color: "#d946ef", icon: "M12 6.25278C12 6.25278 14.9388 4 18.375 4C21.8112 4 22.5 6.25278 22.5 6.25278V19.5106C22.5 19.5106 21.8112 21.7634 18.375 21.7634C14.9388 21.7634 12 19.5106 12 19.5106M12 6.25278C12 6.25278 9.06122 4 5.625 4C2.18878 4 1.5 6.25278 1.5 6.25278V19.5106C1.5 19.5106 2.18878 21.7634 5.625 21.7634C9.06122 21.7634 12 19.5106 12 19.5106M12 6.25278V19.5106", autoLive: true, repetition: "Weekly", weekdays: [2,3], startTime: "14:00", endTime: "16:00", tasks: [], notifications: { enabled: true, notifyBefore: 5, notifyAtStart: true, notifyAtEnd: false } },
    
    // --- INDIVIDUAL SLEEP ROUTINES ---
    ...[
      { id: 1, startTime: "23:00", endTime: "07:00" }, { id: 2, startTime: "22:00", endTime: "06:00" },
      { id: 3, startTime: "00:00", endTime: "08:00" }, { id: 4, startTime: "01:00", endTime: "09:00" },
      { id: 5, startTime: "23:30", endTime: "07:30" }, { id: 6, startTime: "01:30", endTime: "08:30" },
      { id: 7, startTime: "23:00", endTime: "06:00" }, { id: 8, startTime: "22:30", endTime: "06:30" },
      { id: 9, startTime: "00:30", endTime: "08:30" }, { id: 10, startTime: "22:00", endTime: "05:00" }
    ].map(s => ({
      id: 300 + s.id, name: "Nightly Rest", memberId: s.id, description: "Sleep", tags: ["Routine", "Sleep"], color: "#6366f1", icon: "M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.4118 20.9657 10.8351 20.8993 10.2741C19.626 11.4518 17.9103 12.25 16 12.25C12.2721 12.25 9.25 9.22792 9.25 5.5C9.25 3.58971 10.0482 1.87399 11.2259 0.60069C11.7259 0.534293 12.0001 0.5 12 3Z", autoLive: true, repetition: "Daily", startTime: s.startTime, endTime: s.endTime, tasks: [], notifications: { enabled: false, notifyBefore: 0, notifyAtStart: false, notifyAtEnd: false }
    })),

    // --- TASKS & PAYMENTS ---
    { id: 401, name: "Q3 Marketing Report", memberId: 6, description: "Compile and analyze Q3 marketing campaign data.", tags: ["Task", "Work", "Reporting"], color: "#84cc16", icon: "M12 6.25278C12 6.25278 14.9388 4 18.375 4C21.8112 4 22.5 6.25278 22.5 6.25278V19.5106C22.5 19.5106 21.8112 21.7634 18.375 21.7634C14.9388 21.7634 12 19.5106 12 19.5106M12 6.25278C12 6.25278 9.06122 4 5.625 4C2.18878 4 1.5 6.25278 1.5 6.25278V19.5106C1.5 19.5106 2.18878 21.7634 5.625 21.7634C9.06122 21.7634 12 19.5106 12 19.5106M12 6.25278V19.5106", autoLive: false, repetition: "Annually", annualDates: [`${new Date().getFullYear()}-10-05`], startTime: "00:00", endTime: "00:00", tasks: [], notifications: { enabled: true, notifyBefore: 1440, notifyAtStart: false, notifyAtEnd: false } },
    { id: 402, name: "Cloud Services Bill", memberId: 2, description: "Monthly payment for AWS.", tags: ["Payment", "Work", "Finance"], color: "#22c55e", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", autoLive: false, repetition: "Annually", annualDates: [`${new Date().getFullYear()}-09-25`], startTime: "00:00", endTime: "00:00", budget: 3250.75, tasks: [], notifications: { enabled: true, notifyBefore: 2880, notifyAtStart: false, notifyAtEnd: false } }
  ].map(r => r as Routine), // Cast to Routine[] to satisfy TS
};