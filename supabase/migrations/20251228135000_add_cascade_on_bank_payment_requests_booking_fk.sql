-- Update foreign key constraint to cascade deletes from bookings -> bank_payment_requests
-- This will allow deleting a booking to automatically delete related bank_payment_requests rows.

ALTER TABLE public.bank_payment_requests
  DROP CONSTRAINT IF EXISTS bank_payment_requests_booking_id_fkey;

ALTER TABLE public.bank_payment_requests
  ADD CONSTRAINT bank_payment_requests_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

-- Note: Running this migration will change behavior to remove dependent bank payment requests when bookings are deleted.
-- If you prefer to keep requests for audit, consider deleting them manually before deleting bookings or archiving instead.
