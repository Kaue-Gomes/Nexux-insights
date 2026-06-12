-- Allow self-notifications (fix from 002)
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
    IF v_uid IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
      VALUES (v_uid, p_type, left(p_title, 200), left(p_message, 500), p_entity_type, p_entity_id);
    END IF;
  END LOOP;
END;
$$;
