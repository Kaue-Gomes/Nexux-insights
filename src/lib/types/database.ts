export type UserRole = "admin" | "member";
export type ProjectStatus = "planning" | "in_progress" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "backlog" | "in_progress" | "review" | "done";
export type ReminderType = "meeting" | "deadline" | "review" | "other";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  name: string;
  owner_id: string;
  performance: number;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  is_lead: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  team_id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  assignee_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  reminder_date: string;
  reminder_time: string;
  type: ReminderType;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  action: string;
  target: string;
  created_at: string;
};

export type RevenueSnapshot = {
  id: string;
  user_id: string;
  month_label: string;
  revenue: number;
  target: number;
  sort_order: number;
  created_at: string;
};

export type ProjectWithTeam = Project & {
  teams: Pick<Team, "name"> | null;
  member_count?: number;
};

export type TaskWithRelations = Task & {
  projects: Pick<Project, "name"> | null;
  assignee: Pick<Profile, "full_name"> | null;
};

export type TeamWithStats = Team & {
  member_count: number;
  project_count: number;
  lead_name: string | null;
};

export type ActivityWithUser = Activity & {
  profiles: Pick<Profile, "full_name"> | null;
};

export type NotificationType =
  | "task_created"
  | "task_completed"
  | "project_created"
  | "project_started";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

export type DashboardSummary = {
  kpis: {
    label: string;
    value: number;
    delta: string;
    trend: "up" | "down";
    icon: string;
  }[];
  revenueData: { mes: string; receita: number; meta: number }[];
  taskStatusData: { name: string; value: number; color: string }[];
  teamPerformance: { equipe: string; entregas: number; eficiencia: number }[];
  activities: {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
  }[];
  reminders: {
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
  }[];
};
