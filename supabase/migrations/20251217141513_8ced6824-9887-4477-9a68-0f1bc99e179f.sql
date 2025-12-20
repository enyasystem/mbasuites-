-- Create payment_settings table for storing payment gateway configuration
CREATE TABLE public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  location_id UUID REFERENCES public.locations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage payment settings
CREATE POLICY "Admins can manage payment settings" 
ON public.payment_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow all authenticated users (and optionally anonymous/public) to read payment settings
CREATE POLICY "Public can read payment settings"
ON public.payment_settings
FOR SELECT
USING (true);

-- Create bank_payment_requests table for direct bank transfers
CREATE TABLE public.bank_payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_reference TEXT,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_payment_requests ENABLE ROW LEVEL SECURITY;

-- Admins and staff can view and manage bank payment requests
CREATE POLICY "Staff can view bank payment requests" 
ON public.bank_payment_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update bank payment requests" 
ON public.bank_payment_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Users can create bank payment requests
CREATE POLICY "Users can create bank payment requests" 
ON public.bank_payment_requests 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view own bank payment requests" 
ON public.bank_payment_requests 
FOR SELECT 
USING (guest_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_bank_payment_requests_updated_at
BEFORE UPDATE ON public.bank_payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
