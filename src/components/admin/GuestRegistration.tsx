import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { apiCall, showApiError } from '@/lib/api-utils';
import type { GuestRegistrationForm } from '../../types/guestRegistration';

export default function GuestRegistration({ assignedLocationId }: { assignedLocationId?: string }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GuestRegistrationForm>({
    defaultValues: {
      full_name: '',
      age: undefined,
      date_of_birth: '',
      gender: 'Male',
      occupation: '',
      religion: '',
      marital_status: '',
      nationality: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      email: '',
      id_number: '',
      purpose: 'Leisure',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      identification_attachment: null,
      hard_copy_attached: false,
    }
  });

  const onSubmit = async (data: GuestRegistrationForm) => {
    // Ensure user is authenticated and has staff/admin role before uploading
    let userId: string | undefined = undefined;
    try {
      // get authenticated user
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        showApiError(userErr, 'verifying session');
        return;
      }
      userId = userData?.user?.id;
      if (!userId) {
        alert('You must be signed in as staff or admin to register guests.');
        return;
      }

      // check user_roles table for admin/staff role
      const { data: roles, error: rolesErr } = await supabase.from('user_roles').select('role').eq('user_id', userId) as { data: { role: string }[] | null; error: unknown };
      if (rolesErr) {
        showApiError(rolesErr, 'checking permissions');
        return;
      }
      const hasPermission = (roles || []).some((r) => r.role === 'admin' || r.role === 'staff');
      if (!hasPermission) {
        alert('Only staff or admin users can perform guest registrations.');
        return;
      }
    } catch (err) {
      showApiError(err, 'verifying session');
      return;
    }
    // Upload identification attachment if provided
    let attachment_url: string | null = null;
    if (data.identification_attachment && data.identification_attachment.length > 0) {
      const file = data.identification_attachment[0];
      const filePath = `guest_ids/${Date.now()}_${file.name}`;
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('guest_ids')
          .upload(filePath, file, { cacheControl: '0' });

        if (uploadError) {
          const extractErrorMessage = (err: unknown) => {
            if (!err) return '';
            if (typeof err === 'string') return err;
            if (typeof err === 'object' && err !== null) {
              const obj = err as Record<string, unknown>;
              const m = obj['message'];
              if (typeof m === 'string') return m;
              const e = obj['error'];
              if (typeof e === 'string') return e;
              return JSON.stringify(err);
            }
            return String(err);
          };

          const msg = extractErrorMessage(uploadError);
          if (msg && msg.toLowerCase().includes('bucket not found')) {
            showApiError(new Error('Storage bucket "guest_ids" not found. Create a storage bucket named guest_ids in your Supabase project (Storage → New bucket).'), 'uploading identification');
            return;
          }
          throw uploadError;
        }

        // For private buckets, store the object path so we can create signed URLs when needed.
        attachment_url = filePath;
      } catch (err) {
        showApiError(err, 'uploading identification');
        return;
      }
    }

    // Insert into guest_registrations table
    const insertPayload = {
      full_name: data.full_name,
      age: data.age ?? null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender,
      occupation: data.occupation || null,
      religion: data.religion || null,
      marital_status: data.marital_status || null,
      nationality: data.nationality || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      postal_code: data.postal_code || null,
      country: data.country || null,
      phone: data.phone || null,
      email: data.email || null,
      id_number: data.id_number || null,
      purpose: data.purpose || null,
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
      identification_attachment_url: attachment_url,
      hard_copy_attached: data.hard_copy_attached || false,
      // associate registration with assigned location when available
      ...(assignedLocationId ? { location_id: assignedLocationId } : {}),
      // record who registered this guest
      ...(userId ? { registered_by: userId } : {}),
      created_at: new Date().toISOString(),
    } as Record<string, unknown>;

    // supabase types don't include guest_registrations in the generated Database type
    // disable the strict overload check with a narrow eslint exception for this call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error } = await (supabase as any)
      .from('guest_registrations')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      showApiError(error, 'saving guest registration');
      return;
    }

    reset();
    alert('Guest registered successfully.');
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Guest Registration / Manual Check-in</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input {...register('full_name', { required: 'Full name is required' })} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Age</label>
            <Input type="number" {...register('age', { valueAsNumber: true })} />
          </div>

          <div>
            <label className="text-sm font-medium">Date of Birth</label>
            <Input type="date" {...register('date_of_birth')} />
          </div>

          <div>
            <label className="text-sm font-medium">Gender</label>
            <select className="w-full rounded-md border px-3 py-2" {...register('gender')}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Occupation</label>
            <Input {...register('occupation')} />
          </div>

          <div>
            <label className="text-sm font-medium">Religion</label>
            <Input {...register('religion')} />
          </div>

          <div>
            <label className="text-sm font-medium">Marital Status</label>
            <Input {...register('marital_status')} />
          </div>

          <div>
            <label className="text-sm font-medium">Nationality</label>
            <Input {...register('nationality')} />
          </div>

          <div>
            <label className="text-sm font-medium">Home Address</label>
            <Input {...register('address')} />
          </div>

          <div>
            <label className="text-sm font-medium">City</label>
            <Input {...register('city')} />
          </div>

          <div>
            <label className="text-sm font-medium">State</label>
            <Input {...register('state')} />
          </div>

          <div>
            <label className="text-sm font-medium">Postal Code</label>
            <Input {...register('postal_code')} />
          </div>

          <div>
            <label className="text-sm font-medium">Country</label>
            <Input {...register('country')} />
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <Input {...register('phone')} />
          </div>

          <div>
            <label className="text-sm font-medium">Email Address</label>
            <Input type="email" {...register('email')} />
          </div>

          <div>
            <label className="text-sm font-medium">ID / Passport Number</label>
            <Input {...register('id_number')} />
          </div>

          <div>
            <label className="text-sm font-medium">Purpose of Visit</label>
            <select className="w-full rounded-md border px-3 py-2" {...register('purpose')}>
              <option>Business</option>
              <option>Leisure</option>
              <option>Both</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Emergency Contact Name</label>
            <Input {...register('emergency_contact_name')} />
          </div>

          <div>
            <label className="text-sm font-medium">Emergency Contact Phone</label>
            <Input {...register('emergency_contact_phone')} />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Identification Attachment (digital)</label>
            <input type="file" accept="image/*,application/pdf" {...register('identification_attachment')} />
            <p className="text-xs text-muted-foreground mt-1">Upload a scanned ID or passport (optional).</p>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Register Guest'}</Button>
        </div>
      </form>
    </div>
  );
}
