-- =========================================================
-- STAFF_USERS TABLE
-- =========================================================
CREATE TABLE public.staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER trg_staff_users_updated_at
BEFORE UPDATE ON public.staff_users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
