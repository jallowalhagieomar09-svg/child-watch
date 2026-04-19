
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'police', 'welfare');

CREATE TYPE public.report_category AS ENUM (
  'abuse', 'neglect', 'child_labor', 'trafficking',
  'early_marriage', 'school_safety', 'other'
);

CREATE TYPE public.report_agency AS ENUM ('police', 'welfare', 'both');

CREATE TYPE public.report_status AS ENUM (
  'received', 'under_review', 'in_progress', 'resolved', 'closed'
);

CREATE TYPE public.report_language AS ENUM (
  'en', 'mandinka', 'wolof', 'fula', 'jola'
);

CREATE TYPE public.media_kind AS ENUM ('image', 'video', 'audio');

-- =========================================================
-- UTILITY: updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  preferred_language public.report_language NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, contact_email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- USER ROLES (separate table — never on profiles)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role check (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  );
$$;

-- =========================================================
-- REPORTS
-- =========================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT NOT NULL UNIQUE,
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  category public.report_category NOT NULL,
  agency public.report_agency NOT NULL,
  language public.report_language NOT NULL DEFAULT 'en',
  status public.report_status NOT NULL DEFAULT 'received',

  description TEXT,

  -- Optional contact (anonymous reporters can fill these)
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,

  -- Location
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  region TEXT,
  town TEXT,

  -- Staff assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_agency ON public.reports(agency);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_reporter ON public.reports(reporter_user_id);

CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- REPORT MEDIA
-- =========================================================
CREATE TABLE public.report_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  kind public.media_kind NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  transcription TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_media ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_report_media_report ON public.report_media(report_id);

-- =========================================================
-- REPORT STATUS EVENTS (audit trail)
-- =========================================================
CREATE TABLE public.report_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  from_status public.report_status,
  to_status public.report_status,
  note TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_status_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_status_events_report ON public.report_status_events(report_id);

-- =========================================================
-- POLICIES: profiles
-- =========================================================
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Staff view all profiles"
ON public.profiles FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- POLICIES: user_roles (admin-only management; users can read their own)
-- =========================================================
CREATE POLICY "Users view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- POLICIES: reports
-- =========================================================
-- Anyone (including anonymous) can submit a report
CREATE POLICY "Anyone can insert a report"
ON public.reports FOR INSERT
WITH CHECK (
  -- Either anonymous (no user) OR the authenticated user submitting their own
  reporter_user_id IS NULL OR reporter_user_id = auth.uid()
);

-- Reporters see their own reports
CREATE POLICY "Reporters view own reports"
ON public.reports FOR SELECT
USING (auth.uid() IS NOT NULL AND reporter_user_id = auth.uid());

-- Police staff see police + both
CREATE POLICY "Police view police reports"
ON public.reports FOR SELECT
USING (public.has_role(auth.uid(), 'police') AND agency IN ('police', 'both'));

-- Welfare staff see welfare + both
CREATE POLICY "Welfare view welfare reports"
ON public.reports FOR SELECT
USING (public.has_role(auth.uid(), 'welfare') AND agency IN ('welfare', 'both'));

-- Admins see all
CREATE POLICY "Admins view all reports"
ON public.reports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Staff can update reports they can see
CREATE POLICY "Police update police reports"
ON public.reports FOR UPDATE
USING (public.has_role(auth.uid(), 'police') AND agency IN ('police', 'both'));

CREATE POLICY "Welfare update welfare reports"
ON public.reports FOR UPDATE
USING (public.has_role(auth.uid(), 'welfare') AND agency IN ('welfare', 'both'));

CREATE POLICY "Admins update all reports"
ON public.reports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- POLICIES: report_media
-- =========================================================
CREATE POLICY "Anyone can insert media"
ON public.report_media FOR INSERT
WITH CHECK (true);

CREATE POLICY "Reporters view own media"
ON public.report_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_media.report_id
      AND r.reporter_user_id = auth.uid()
  )
);

CREATE POLICY "Staff view media for visible reports"
ON public.report_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_media.report_id
      AND (
        public.has_role(auth.uid(), 'admin')
        OR (public.has_role(auth.uid(), 'police') AND r.agency IN ('police','both'))
        OR (public.has_role(auth.uid(), 'welfare') AND r.agency IN ('welfare','both'))
      )
  )
);

-- Staff can attach transcriptions
CREATE POLICY "Staff update media"
ON public.report_media FOR UPDATE
USING (public.is_staff(auth.uid()));

-- =========================================================
-- POLICIES: report_status_events
-- =========================================================
CREATE POLICY "Staff insert status events"
ON public.report_status_events FOR INSERT
WITH CHECK (public.is_staff(auth.uid()) AND actor_user_id = auth.uid());

CREATE POLICY "Staff view status events for visible reports"
ON public.report_status_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_status_events.report_id
      AND (
        public.has_role(auth.uid(), 'admin')
        OR (public.has_role(auth.uid(), 'police') AND r.agency IN ('police','both'))
        OR (public.has_role(auth.uid(), 'welfare') AND r.agency IN ('welfare','both'))
      )
  )
);

-- Reporters see only NON-internal events on their own reports
CREATE POLICY "Reporters view public events on own reports"
ON public.report_status_events FOR SELECT
USING (
  is_internal = false AND
  EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_status_events.report_id
      AND r.reporter_user_id = auth.uid()
  )
);

-- =========================================================
-- PUBLIC LOOKUP BY TRACKING CODE (safe, no PII)
-- =========================================================
CREATE OR REPLACE FUNCTION public.lookup_report_by_code(_code TEXT)
RETURNS TABLE (
  tracking_code TEXT,
  category public.report_category,
  status public.report_status,
  language public.report_language,
  region TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tracking_code, category, status, language, region, created_at, updated_at
  FROM public.reports
  WHERE tracking_code = _code
  LIMIT 1;
$$;

-- =========================================================
-- PUBLIC AGGREGATE STATS (with small-cell suppression)
-- =========================================================
CREATE OR REPLACE FUNCTION public.public_stats_overview()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total INT;
  _resolved INT;
  _this_month INT;
  _avg_resolution_hours NUMERIC;
  _by_category JSONB;
  _by_status JSONB;
  _by_region JSONB;
  _by_language JSONB;
  _by_month JSONB;
BEGIN
  SELECT COUNT(*) INTO _total FROM public.reports;
  SELECT COUNT(*) INTO _resolved FROM public.reports WHERE status = 'resolved';
  SELECT COUNT(*) INTO _this_month FROM public.reports
    WHERE created_at >= date_trunc('month', now());

  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600.0), 0)
  INTO _avg_resolution_hours
  FROM public.reports WHERE status = 'resolved';

  -- Category counts (suppress < 5)
  SELECT COALESCE(jsonb_agg(jsonb_build_object('key', key, 'count', c)), '[]'::jsonb)
  INTO _by_category
  FROM (
    SELECT category::text AS key, COUNT(*) AS c
    FROM public.reports
    GROUP BY category
    HAVING COUNT(*) >= 5
  ) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('key', key, 'count', c)), '[]'::jsonb)
  INTO _by_status
  FROM (
    SELECT status::text AS key, COUNT(*) AS c
    FROM public.reports
    GROUP BY status
    HAVING COUNT(*) >= 5
  ) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('key', key, 'count', c)), '[]'::jsonb)
  INTO _by_region
  FROM (
    SELECT COALESCE(region, 'unknown') AS key, COUNT(*) AS c
    FROM public.reports
    GROUP BY COALESCE(region, 'unknown')
    HAVING COUNT(*) >= 5
  ) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('key', key, 'count', c)), '[]'::jsonb)
  INTO _by_language
  FROM (
    SELECT language::text AS key, COUNT(*) AS c
    FROM public.reports
    GROUP BY language
    HAVING COUNT(*) >= 5
  ) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('month', month, 'count', c) ORDER BY month), '[]'::jsonb)
  INTO _by_month
  FROM (
    SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*) AS c
    FROM public.reports
    WHERE created_at >= (now() - interval '12 months')
    GROUP BY date_trunc('month', created_at)
  ) t;

  RETURN jsonb_build_object(
    'total', _total,
    'resolved', _resolved,
    'this_month', _this_month,
    'avg_resolution_hours', _avg_resolution_hours,
    'by_category', _by_category,
    'by_status', _by_status,
    'by_region', _by_region,
    'by_language', _by_language,
    'by_month', _by_month
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.public_stats_overview() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_report_by_code(TEXT) TO anon, authenticated;

-- =========================================================
-- STORAGE: private report-media bucket
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-media', 'report-media', false);

-- Anyone can upload (anonymous reporting)
CREATE POLICY "Anyone can upload report media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-media');

-- Reporters can read their own folder (folder name = report id)
CREATE POLICY "Reporters read own report media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'report-media'
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id::text = (storage.foldername(name))[1]
      AND r.reporter_user_id = auth.uid()
  )
);

-- Staff can read media for reports they can see
CREATE POLICY "Staff read report media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'report-media'
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id::text = (storage.foldername(name))[1]
      AND (
        public.has_role(auth.uid(), 'admin')
        OR (public.has_role(auth.uid(), 'police') AND r.agency IN ('police','both'))
        OR (public.has_role(auth.uid(), 'welfare') AND r.agency IN ('welfare','both'))
      )
  )
);
