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

-- =========================================================
-- CREATE STAFF USER
-- =========================================================
-- Create the staff user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'jallowalhagieomar09@gmail.com',
  crypt('OmarGPF1', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Add to staff_users table
INSERT INTO public.staff_users (id, email)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'jallowalhagieomar09@gmail.com'
) ON CONFLICT (email) DO NOTHING;

-- Assign admin role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin'
) ON CONFLICT (user_id, role) DO NOTHING;
