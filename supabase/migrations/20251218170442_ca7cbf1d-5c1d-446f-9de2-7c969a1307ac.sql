-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload payment proofs
CREATE POLICY "Users can upload payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

-- Allow users to view their own uploaded proofs
CREATE POLICY "Users can view their payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow staff/admin to view all payment proofs
CREATE POLICY "Staff can view all payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
);