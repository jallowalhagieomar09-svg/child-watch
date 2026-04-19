GRANT SELECT, INSERT ON public.reports TO anon, authenticated;
GRANT SELECT, INSERT ON public.report_media TO anon, authenticated;
GRANT SELECT ON public.report_status_events TO anon, authenticated;
GRANT INSERT ON public.report_status_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT UPDATE ON public.reports TO authenticated;
GRANT UPDATE ON public.report_media TO authenticated;