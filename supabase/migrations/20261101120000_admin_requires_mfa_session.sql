-- An admin who has enrolled TOTP only counts as admin in an aal2 session. Without this, someone holding
-- the password alone could sign in (aal1) and call the Data API directly, skipping the app's MFA step.
-- Same rule as Supabase's "enforce MFA for users who have enrolled" policy pattern.
CREATE OR REPLACE FUNCTION public.school_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (SELECT 1 FROM public.school_admins WHERE user_id = (SELECT auth.uid()))
       AND (
           (SELECT auth.jwt() ->> 'aal') = 'aal2'
           OR NOT EXISTS (
               SELECT 1 FROM auth.mfa_factors
               WHERE user_id = (SELECT auth.uid()) AND status = 'verified'
           )
       );
$$;
