
-- 1. Public metadata view (no content_url)
CREATE OR REPLACE VIEW public.course_modules_public
WITH (security_invoker = on) AS
SELECT id, module_index, title, description, price_bdt, is_published, created_at
FROM public.course_modules
WHERE is_published = true;

GRANT SELECT ON public.course_modules_public TO anon, authenticated;

-- 2. Tighten base table SELECT: only enrolled (paid) users for their module, or admin
DROP POLICY IF EXISTS "Anyone can view published modules" ON public.course_modules;

CREATE POLICY "Enrolled users read their paid modules"
ON public.course_modules
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.module_enrollments me
    WHERE me.user_id = auth.uid()
      AND me.module_index = course_modules.module_index
      AND me.status = 'paid'
  )
);

-- 3. Audit-logged RPC to fetch a module's paid content URL
CREATE OR REPLACE FUNCTION public.get_course_module_content_url(_module_index integer)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_url text;
BEGIN
  IF v_uid IS NULL THEN
    PERFORM public.log_access_audit('get_module_content_url','course_module',_module_index::text,'denied','no_session');
    RETURN NULL;
  END IF;

  IF has_role(v_uid,'admin'::app_role) THEN
    SELECT content_url INTO v_url FROM public.course_modules WHERE module_index = _module_index AND is_published = true;
    PERFORM public.log_access_audit('get_module_content_url','course_module',_module_index::text,'granted','admin');
    RETURN v_url;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.module_enrollments
    WHERE user_id = v_uid AND module_index = _module_index AND status = 'paid'
  ) THEN
    PERFORM public.log_access_audit('get_module_content_url','course_module',_module_index::text,'denied','not_paid');
    RETURN NULL;
  END IF;

  SELECT content_url INTO v_url FROM public.course_modules WHERE module_index = _module_index AND is_published = true;
  PERFORM public.log_access_audit('get_module_content_url','course_module',_module_index::text,'granted','paid_enrollment');
  RETURN v_url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_course_module_content_url(integer) TO authenticated;

-- 4. Audit-logged RPC to fetch a class material (storage_path + external_url)
CREATE OR REPLACE FUNCTION public.get_class_material_access(_material_id uuid)
RETURNS TABLE(id uuid, class_id uuid, kind text, title text, storage_path text, external_url text, mime text, size_bytes bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_class uuid;
  v_teacher uuid;
  v_mode text;
BEGIN
  IF v_uid IS NULL THEN
    PERFORM public.log_access_audit('get_class_material','class_material',_material_id::text,'denied','no_session');
    RETURN;
  END IF;

  SELECT cm.class_id, cm.teacher_id INTO v_class, v_teacher
  FROM public.class_materials cm WHERE cm.id = _material_id;

  IF v_class IS NULL THEN
    PERFORM public.log_access_audit('get_class_material','class_material',_material_id::text,'denied','not_found');
    RETURN;
  END IF;

  IF v_teacher = v_uid OR has_role(v_uid,'admin'::app_role) THEN
    PERFORM public.log_access_audit('get_class_material','class_material',_material_id::text,'granted',
      CASE WHEN has_role(v_uid,'admin'::app_role) THEN 'admin' ELSE 'owner' END);
    RETURN QUERY SELECT cm.id, cm.class_id, cm.kind, cm.title, cm.storage_path, cm.external_url, cm.mime, cm.size_bytes
      FROM public.class_materials cm WHERE cm.id = _material_id;
    RETURN;
  END IF;

  SELECT audience_mode INTO v_mode FROM public.live_classes WHERE id = v_class;

  IF v_mode = 'enrolled' AND has_confirmed_enrollment(v_uid) THEN
    PERFORM public.log_access_audit('get_class_material','class_material',_material_id::text,'granted','enrolled');
    RETURN QUERY SELECT cm.id, cm.class_id, cm.kind, cm.title, cm.storage_path, cm.external_url, cm.mime, cm.size_bytes
      FROM public.class_materials cm WHERE cm.id = _material_id;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.live_class_rsvps WHERE class_id = v_class AND user_id = v_uid) THEN
    PERFORM public.log_access_audit('get_class_material','class_material',_material_id::text,'granted','rsvp');
    RETURN QUERY SELECT cm.id, cm.class_id, cm.kind, cm.title, cm.storage_path, cm.external_url, cm.mime, cm.size_bytes
      FROM public.class_materials cm WHERE cm.id = _material_id;
    RETURN;
  END IF;

  PERFORM public.log_access_audit('get_class_material','class_material',_material_id::text,'denied','no_access');
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_material_access(uuid) TO authenticated;
