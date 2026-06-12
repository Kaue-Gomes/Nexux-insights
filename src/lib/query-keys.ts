export const queryKeys = {
  dashboard: ["dashboard"] as const,
  projects: (filter?: string) => ["projects", filter] as const,
  tasks: (filter?: string) => ["tasks", filter] as const,
  teams: ["teams"] as const,
  reminders: ["reminders"] as const,
  reports: ["reports"] as const,
  profile: ["profile"] as const,
  projectsSelect: ["projects-select"] as const,
  teamsSelect: ["teams-select"] as const,
  notifications: ["notifications"] as const,
};
