-- Permitir que un usuario autenticado se auto-asigne el rol de vendedor (solo para su propio user_id)
CREATE POLICY "Users can self-activate vendedor role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'vendedor'::app_role
);

-- Requerir RFC en el perfil antes de permitir activar el rol vendedor
CREATE OR REPLACE FUNCTION public.enforce_vendedor_requires_rfc()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_rfc text;
BEGIN
  IF NEW.role = 'vendedor'::app_role THEN
    SELECT p.rfc INTO v_rfc
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;

    IF v_rfc IS NULL OR length(trim(v_rfc)) = 0 THEN
      RAISE EXCEPTION 'RFC requerido para activar cuenta de vendedor';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_roles_require_rfc ON public.user_roles;
CREATE TRIGGER trg_user_roles_require_rfc
BEFORE INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_vendedor_requires_rfc();
