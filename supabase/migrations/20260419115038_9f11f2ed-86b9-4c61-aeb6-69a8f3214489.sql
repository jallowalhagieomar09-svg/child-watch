CREATE OR REPLACE FUNCTION public.submit_report(
  _tracking_code text,
  _category public.report_category,
  _agency public.report_agency,
  _language public.report_language,
  _description text DEFAULT NULL,
  _contact_name text DEFAULT NULL,
  _contact_phone text DEFAULT NULL,
  _contact_email text DEFAULT NULL,
  _latitude double precision DEFAULT NULL,
  _longitude double precision DEFAULT NULL,
  _region text DEFAULT NULL,
  _town text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO public.reports (
    tracking_code, reporter_user_id, category, agency, language,
    description, contact_name, contact_phone, contact_email,
    latitude, longitude, region, town
  ) VALUES (
    _tracking_code, auth.uid(), _category, _agency, _language,
    NULLIF(trim(_description), ''), NULLIF(trim(_contact_name), ''),
    NULLIF(trim(_contact_phone), ''), NULLIF(trim(_contact_email), ''),
    _latitude, _longitude,
    NULLIF(trim(_region), ''), NULLIF(trim(_town), '')
  )
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_report(text, public.report_category, public.report_agency, public.report_language, text, text, text, text, double precision, double precision, text, text) TO anon, authenticated;