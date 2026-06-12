-- Notifications + security helpers
CREATE TYPE public.notification_type AS ENUM (
  'task_created',
  'task_completed',
  'project_created',
  'project_started'
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Inserts only via SECURITY DEFINER function (server-side / triggers)
CREATE OR REPLACE FUNCTION public.create_notifications(
  p_user_ids UUID[],
  p_type public.notification_type,
  p_title TEXT,
  p_message TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
BEGIN
  IF p_user_ids IS NULL OR array_length(p_user_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  FOREACH v_uid IN ARRAY p_user_ids
  LOOP
    IF v_uid IS NOT NULL AND v_uid <> auth.uid() THEN
      INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
      VALUES (v_uid, p_type, left(p_title, 200), left(p_message, 500), p_entity_type, p_entity_id);
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_project_team_member_ids(p_project_id UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT tm.user_id), ARRAY[]::UUID[])
  FROM public.projects p
  JOIN public.team_members tm ON tm.team_id = p.team_id
  WHERE p.id = p_project_id;
$$;

GRANT EXECUTE ON FUNCTION public.create_notifications(UUID[], public.notification_type, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_team_member_ids(UUID) TO authenticated;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
