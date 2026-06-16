-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'agent')) NOT NULL DEFAULT 'agent',
  agent_code TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  status TEXT CHECK (status IN ('active', 'suspended', 'deleted')) DEFAULT 'active',
  employment_date DATE,
  target NUMERIC DEFAULT 0,
  territory TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Products Table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  min_price NUMERIC NOT NULL DEFAULT 0,
  rec_price NUMERIC NOT NULL DEFAULT 0,
  commission_info TEXT,
  resources_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Leads Table
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  industry TEXT,
  product_of_interest TEXT,
  estimated_budget NUMERIC,
  source TEXT,
  status TEXT CHECK (status IN ('new', 'contacted', 'follow_up', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost')) DEFAULT 'new',
  notes TEXT,
  attachments_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own leads, admins can view all" ON public.leads
  FOR SELECT USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can insert own leads, admins can insert any" ON public.leads
  FOR INSERT WITH CHECK (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can update own leads, admins can update any" ON public.leads
  FOR UPDATE USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can delete own leads, admins can delete any" ON public.leads
  FOR DELETE USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Customers Table
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'churned')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own customers, admins can view all" ON public.customers
  FOR SELECT USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can insert own customers, admins can insert any" ON public.customers
  FOR INSERT WITH CHECK (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can update own customers, admins can update any" ON public.customers
  FOR UPDATE USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can delete own customers, admins can delete any" ON public.customers
  FOR DELETE USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Sales Table
CREATE TABLE public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  sale_price NUMERIC NOT NULL,
  min_price NUMERIC NOT NULL,
  deposit_paid NUMERIC DEFAULT 0,
  balance_due NUMERIC DEFAULT 0,
  payment_method TEXT,
  sale_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending_approval', 'approved', 'rejected')) DEFAULT 'pending_approval',
  notes TEXT,
  agreement_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own sales, admins can view all" ON public.sales
  FOR SELECT USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can insert own sales, admins can insert any" ON public.sales
  FOR INSERT WITH CHECK (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can update own sales, admins can update any" ON public.sales
  FOR UPDATE USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can delete own sales, admins can delete any" ON public.sales
  FOR DELETE USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Commissions Table
CREATE TABLE public.commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  base_commission NUMERIC NOT NULL,
  upsell_bonus NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own commissions, admins can view all" ON public.commissions
  FOR SELECT USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update commissions" ON public.commissions
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Custom Requests Table
CREATE TABLE public.custom_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  industry TEXT,
  project_title TEXT,
  requested_service TEXT,
  detailed_requirements TEXT,
  business_challenges TEXT,
  expected_features TEXT,
  preferred_design_style TEXT,
  budget NUMERIC,
  timeline TEXT,
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('new_request', 'under_review', 'quotation_prepared', 'proposal_sent', 'approved', 'in_development', 'completed', 'rejected')) DEFAULT 'new_request',
  attachments_url TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own requests, admins can view all" ON public.custom_requests
  FOR SELECT USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can insert own requests, admins can insert any" ON public.custom_requests
  FOR INSERT WITH CHECK (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can update own requests, admins can update any" ON public.custom_requests
  FOR UPDATE USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. Renewals Table
CREATE TABLE public.renewals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  renewal_amount NUMERIC NOT NULL,
  renewal_date DATE NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'notified', 'renewed', 'expired')) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view renewals for their customers, admins can view all" ON public.renewals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND agent_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert/update/delete renewals" ON public.renewals
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. Commission Calculation Trigger
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
DECLARE
  approved_sales_count INT;
  commission_rate NUMERIC;
  base_commission NUMERIC;
  upsell_bonus NUMERIC;
  total_commission NUMERIC;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Count previously approved sales for this agent
    SELECT COUNT(*) INTO approved_sales_count
    FROM public.sales
    WHERE agent_id = NEW.agent_id AND status = 'approved' AND id != NEW.id;

    IF approved_sales_count < 10 THEN
      commission_rate := 0.20;
    ELSE
      commission_rate := 0.30;
    END IF;

    base_commission := NEW.sale_price * commission_rate;
    
    IF NEW.sale_price > NEW.min_price THEN
      upsell_bonus := (NEW.sale_price - NEW.min_price) * 0.50;
    ELSE
      upsell_bonus := 0;
    END IF;

    total_commission := base_commission + upsell_bonus;

    INSERT INTO public.commissions (sale_id, agent_id, amount, base_commission, upsell_bonus, status)
    VALUES (NEW.id, NEW.agent_id, total_commission, base_commission, upsell_bonus, 'pending');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_commission
AFTER UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION calculate_commission();

-- 10. Handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'agent'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
