
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- course_modules
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_index INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_bdt INT NOT NULL DEFAULT 2000,
  content_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published modules" ON public.course_modules FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage modules" ON public.course_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- module_enrollments
CREATE TABLE public.module_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_index INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  bkash_payment_id TEXT,
  bkash_trx_id TEXT,
  amount_bdt INT NOT NULL DEFAULT 2000,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_enroll_user_module ON public.module_enrollments(user_id, module_index);
CREATE UNIQUE INDEX uniq_paid_per_user_module ON public.module_enrollments(user_id, module_index) WHERE status = 'paid';
ALTER TABLE public.module_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own enrollments" ON public.module_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all enrollments" ON public.module_enrollments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update enrollments" ON public.module_enrollments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON public.module_enrollments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed 8 TrendFlux modules
INSERT INTO public.course_modules (module_index, title, description, price_bdt) VALUES
(1, 'AI Trend Discovery System', 'AI tools দিয়ে viral trend বের করার complete framework শিখুন।', 2000),
(2, 'Prompt Engineering for Marketing', 'High-converting content তৈরির জন্য advanced prompt techniques।', 2000),
(3, 'Visual Brand Automation', 'Brand asset, social post, ad creative — সব AI দিয়ে automate করুন।', 2000),
(4, 'AI Copywriting & Content Engine', 'এক ক্লিকে blog, ad, email — scalable content factory বানান।', 2000),
(5, 'Video & Reels with AI', 'Faceless reels, script থেকে edit — সম্পূর্ণ AI video pipeline।', 2000),
(6, 'AI Sales Funnel & Landing Pages', 'Lovable + AI দিয়ে high-converting funnel ও landing page।', 2000),
(7, 'Client Acquisition Playbook', 'Bangladesh ও international client পাওয়ার proven outreach system।', 2000),
(8, 'Master Project & Portfolio System', 'নিজের automated brand দাঁড় করিয়ে portfolio-ready project।', 2000);
