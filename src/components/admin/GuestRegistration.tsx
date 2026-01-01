import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { apiCall, showApiError } from '@/lib/api-utils';
import type { GuestRegistrationForm } from '../../types/guestRegistration';

export default function GuestRegistration() {
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
    // Upload identification attachment if provided
    let attachment_url: string | null = null;
    if (data.identification_attachment && data.identification_attachment.length > 0) {
      const file = data.identification_attachment[0];
      const filePath = `guest_ids/${Date.now()}_${file.name}`;
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('guest_ids')
          .upload(filePath, file, { cacheControl: '0' });
        if (uploadError) throw uploadError;
        const pub = supabase.storage.from('guest_ids').getPublicUrl(filePath);
        // v2 returns { data: { publicUrl: string } }
        // safe access with fallback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachment_url = (pub as any)?.data?.publicUrl ?? null;
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

          <div className="md:col-span-2 flex items-center gap-3">
            <input type="checkbox" {...register('hard_copy_attached')} />
            <label className="text-sm">Attach photocopy (hard copy submitted)</label>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Register Guest'}</Button>
        </div>
      </form>
    </div>
  );
}
