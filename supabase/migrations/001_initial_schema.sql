-- Nexus Insight — Schema inicial
-- Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'member');
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'completed', 'overdue');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.task_status AS ENUM ('backlog', 'in_progress', 'review', 'done');
CREATE TYPE public.reminder_type AS ENUM ('meeting', 'deadline', 'review', 'other');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  performance INTEGER NOT NULL DEFAULT 80 CHECK (performance >= 0 AND performance <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members (N:N)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_lead BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status public.project_status NOT NULL DEFAULT 'planning',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'backlog',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reminders
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  reminder_time TIME NOT NULL DEFAULT '09:00',
  type public.reminder_type NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities (audit feed)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revenue snapshots for dashboard charts
CREATE TABLE public.revenue_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_label TEXT NOT NULL,
  revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  target NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_projects_team_id ON public.projects(team_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_revenue_snapshots_user_id ON public.revenue_snapshots(user_id);

-- Helper: check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$;

-- Helper: check project access via team
CREATE OR REPLACE FUNCTION public.has_project_access(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.team_members tm ON tm.team_id = p.team_id
    WHERE p.id = p_project_id AND tm.user_id = auth.uid()
  );
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bootstrap demo data for new users
CREATE OR REPLACE FUNCTION public.bootstrap_user_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_team_eng UUID;
  v_team_design UUID;
  v_team_marketing UUID;
  v_proj_mobile UUID;
  v_proj_rebrand UUID;
  v_proj_crm UUID;
BEGIN
  IF v_user_id IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.teams WHERE owner_id = v_user_id LIMIT 1) THEN RETURN; END IF;

  INSERT INTO public.teams (name, owner_id, performance) VALUES ('Engenharia', v_user_id, 92) RETURNING id INTO v_team_eng;
  INSERT INTO public.teams (name, owner_id, performance) VALUES ('Design', v_user_id, 88) RETURNING id INTO v_team_design;
  INSERT INTO public.teams (name, owner_id, performance) VALUES ('Marketing', v_user_id, 81) RETURNING id INTO v_team_marketing;

  INSERT INTO public.team_members (team_id, user_id, is_lead) VALUES
    (v_team_eng, v_user_id, true),
    (v_team_design, v_user_id, true),
    (v_team_marketing, v_user_id, true);

  INSERT INTO public.projects (team_id, name, status, progress, due_date) VALUES
    (v_team_eng, 'Plataforma Mobile v2', 'in_progress', 72, '2026-07-15') RETURNING id INTO v_proj_mobile;
  INSERT INTO public.projects (team_id, name, status, progress, due_date) VALUES
    (v_team_design, 'Rebranding 2026', 'in_progress', 45, '2026-08-01') RETURNING id INTO v_proj_rebrand;
  INSERT INTO public.projects (team_id, name, status, progress, due_date) VALUES
    (v_team_eng, 'Integração CRM', 'overdue', 58, '2026-06-01') RETURNING id INTO v_proj_crm;

  INSERT INTO public.tasks (project_id, title, assignee_id, priority, status, due_date) VALUES
    (v_proj_mobile, 'Implementar autenticação JWT', v_user_id, 'high', 'in_progress', '2026-06-15'),
    (v_proj_rebrand, 'Design system — tokens de cor', v_user_id, 'medium', 'review', '2026-06-18'),
    (v_proj_crm, 'Migrar banco para PostgreSQL', v_user_id, 'critical', 'in_progress', '2026-06-12'),
    (v_proj_mobile, 'Testes E2E checkout', v_user_id, 'medium', 'done', '2026-06-10');

  INSERT INTO public.reminders (user_id, title, reminder_date, reminder_time, type) VALUES
    (v_user_id, 'Daily de engenharia', CURRENT_DATE, '09:30', 'meeting'),
    (v_user_id, 'Entrega — Migração CRM', CURRENT_DATE, '18:00', 'deadline'),
    (v_user_id, 'Review de design system', CURRENT_DATE + 1, '14:00', 'review');

  INSERT INTO public.activities (user_id, action, target) VALUES
    (v_user_id, 'concluiu a tarefa', 'Testes E2E checkout'),
    (v_user_id, 'atualizou o projeto', 'Rebranding 2026'),
    (v_user_id, 'criou a tarefa', 'Migrar banco para PostgreSQL');

  INSERT INTO public.revenue_snapshots (user_id, month_label, revenue, target, sort_order) VALUES
    (v_user_id, 'Jan', 32000, 30000, 1),
    (v_user_id, 'Fev', 41000, 35000, 2),
    (v_user_id, 'Mar', 38000, 38000, 3),
    (v_user_id, 'Abr', 52000, 42000, 4),
    (v_user_id, 'Mai', 47000, 45000, 5),
    (v_user_id, 'Jun', 61000, 50000, 6),
    (v_user_id, 'Jul', 68000, 55000, 7);
END;
$$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR id IN (
    SELECT tm2.user_id FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid()
  ));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Teams policies
CREATE POLICY teams_select ON public.teams FOR SELECT TO authenticated
  USING (public.is_team_member(id) OR owner_id = auth.uid());
CREATE POLICY teams_insert ON public.teams FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY teams_delete ON public.teams FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY team_members_select ON public.team_members FOR SELECT TO authenticated
  USING (public.is_team_member(team_id));
CREATE POLICY team_members_insert ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
    OR user_id = auth.uid()
  );
CREATE POLICY team_members_delete ON public.team_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );

-- Projects policies
CREATE POLICY projects_select ON public.projects FOR SELECT TO authenticated
  USING (public.is_team_member(team_id));
CREATE POLICY projects_insert ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id));
CREATE POLICY projects_update ON public.projects FOR UPDATE TO authenticated
  USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));
CREATE POLICY projects_delete ON public.projects FOR DELETE TO authenticated
  USING (public.is_team_member(team_id));

-- Tasks policies
CREATE POLICY tasks_select ON public.tasks FOR SELECT TO authenticated
  USING (public.has_project_access(project_id));
CREATE POLICY tasks_insert ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.has_project_access(project_id));
CREATE POLICY tasks_update ON public.tasks FOR UPDATE TO authenticated
  USING (public.has_project_access(project_id)) WITH CHECK (public.has_project_access(project_id));
CREATE POLICY tasks_delete ON public.tasks FOR DELETE TO authenticated
  USING (public.has_project_access(project_id));

-- Reminders policies
CREATE POLICY reminders_all ON public.reminders FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Activities policies
CREATE POLICY activities_select ON public.activities FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT tm2.user_id FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
    )
  );
CREATE POLICY activities_insert ON public.activities FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Revenue snapshots policies
CREATE POLICY revenue_select ON public.revenue_snapshots FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY revenue_insert ON public.revenue_snapshots FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY revenue_update ON public.revenue_snapshots FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Grant execute on bootstrap function
GRANT EXECUTE ON FUNCTION public.bootstrap_user_data() TO authenticated;
