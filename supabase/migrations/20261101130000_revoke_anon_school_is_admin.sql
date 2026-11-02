-- Only policies for the authenticated role call school_is_admin(); anon had EXECUTE through PUBLIC's
-- default grant (Supabase advisor: anon_security_definer_function_executable).
REVOKE EXECUTE ON FUNCTION public.school_is_admin() FROM PUBLIC, anon;
