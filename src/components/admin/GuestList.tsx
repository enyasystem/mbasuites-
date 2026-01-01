import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

type GuestRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  id_number: string | null;
  identification_attachment_url: string | null;
  purpose: string | null;
  created_at: string | null;
  hard_copy_attached: boolean | null;
};

export default function GuestList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['guest_registrations'],
    queryFn: async (): Promise<GuestRow[]> => {
      // supabase types may not include this table; use `any` for the call
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase as any).from('guest_registrations').select('*').order('created_at', { ascending: false });
      if (res.error) throw res.error;
      return res.data || [];
    },
  });

  if (isLoading) {
    return <div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-48" /></div>;
  }

  if (error) {
    return <div className="text-destructive">Failed to load registered guests.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Registered Guests</h2>
      {data && data.length === 0 ? (
        <p className="text-muted-foreground">No registered guests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Email</th>
                <th className="p-2">ID Number</th>
                <th className="p-2">Attachment</th>
                <th className="p-2">Purpose</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((g) => (
                <tr key={g.id} className="border-b">
                  <td className="p-2">{g.full_name}</td>
                  <td className="p-2">{g.phone ?? '-'}</td>
                  <td className="p-2">{g.email ?? '-'}</td>
                  <td className="p-2">{g.id_number ?? '-'}</td>
                  <td className="p-2">{g.identification_attachment_url ? <a className="text-primary underline" href={g.identification_attachment_url} target="_blank" rel="noreferrer">View</a> : '-'}</td>
                  <td className="p-2">{g.purpose ?? '-'}</td>
                  <td className="p-2">{g.created_at ? new Date(g.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
