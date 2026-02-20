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
  signedUrl?: string | null;
  registered_by?: string | null;
  registrant_name?: string | null;
  purpose: string | null;
  created_at: string | null;
  hard_copy_attached: boolean | null;
};

export default function GuestList() {
  const getErrorMessage = (e: unknown): string => {
    if (typeof e === 'string') return e;
    if (e && typeof e === 'object') {
      const obj = e as Record<string, unknown>;
      const m = obj.message ?? obj.error ?? obj.msg;
      if (typeof m === 'string') return m;
    }
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['guest_registrations'],
    queryFn: async (): Promise<GuestRow[]> => {
      // Typed select for guest_registrations
      const { data: rowsData, error: rowsError } = await supabase
        .from<GuestRow>('guest_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (rowsError) throw rowsError;
      const rows: GuestRow[] = rowsData || [];

      // Fetch registrant profiles for any rows that have registered_by set
      const userIds = Array.from(new Set(rows.map(r => r.registered_by).filter(Boolean))) as string[];
      const profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};
      if (userIds.length > 0) {
        type Profile = { id: string; full_name?: string | null; email?: string | null };
        const { data: profiles } = await supabase
          .from<Profile>('profiles')
          .select('id, full_name, email')
          .in('id', userIds as string[]);
        (profiles || []).forEach((p) => {
          profilesMap[p.id] = { full_name: p.full_name ?? null, email: p.email ?? null };
        });
      }

      // For private storage, convert stored object paths to signed URLs for viewing.
      const enhanced = await Promise.all(rows.map(async (r) => {
        const path = r.identification_attachment_url;
        console.debug('GuestList: stored path for row', r.id, path);
        const registrantName = profilesMap[r.registered_by]?.full_name ?? profilesMap[r.registered_by]?.email ?? null;
        if (!path) return { ...r, signedUrl: null, registrant_name: registrantName } as GuestRow;
        if (path.startsWith('http')) {
          console.debug('GuestList: attachment already a public URL for row', r.id);
          return { ...r, signedUrl: path, registrant_name: profilesMap[r.registered_by]?.full_name ?? profilesMap[r.registered_by]?.email ?? null } as GuestRow;
        }
        try {
          const { data: signed, error: signedError } = await supabase.storage.from('guest_ids').createSignedUrl(path, 60);
          if (signedError) {
            console.error('GuestList: createSignedUrl returned error for path', path, 'row', r.id, signedError);
            const errMsg = getErrorMessage(signedError);
            if (errMsg.toLowerCase().includes('bucket not found') || errMsg.toLowerCase().includes('guest_ids')) {
              throw new Error('Storage bucket "guest_ids" not found');
            }
            return { ...r, signedUrl: null, registrant_name: profilesMap[r.registered_by]?.full_name ?? profilesMap[r.registered_by]?.email ?? null } as GuestRow;
          }
          return { ...r, signedUrl: signed?.signedUrl ?? null, registrant_name: profilesMap[r.registered_by]?.full_name ?? profilesMap[r.registered_by]?.email ?? null } as GuestRow;
        } catch (err) {
          console.error('GuestList: exception creating signed url for path', path, 'row', r.id, err);
          if (err instanceof Error && err.message.toLowerCase().includes('bucket not found')) throw err;
          return { ...r, signedUrl: null, registrant_name: profilesMap[r.registered_by]?.full_name ?? profilesMap[r.registered_by]?.email ?? null } as GuestRow;
        }
      }));

      return enhanced;
    },
    // Avoid re-querying signed URLs and registrant profiles every time the
    // component remounts (e.g. when switching to another admin tab).
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Mount/unmount tracing and data change logging
  React.useEffect(() => {
    console.log("GuestList: mounted");
    return () => console.log("GuestList: unmounted");
  }, []);

  React.useEffect(() => {
    console.log("GuestList: data length", data?.length ?? 0);
  }, [data]);

  if (isLoading) {
    return <div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-48" /></div>;
  }

  if (error) {
    // Provide actionable guidance when storage bucket is missing
    const msg = (error as Error)?.message || '';
    if (msg.toLowerCase().includes('guest_ids') || msg.toLowerCase().includes('bucket not found')) {
      return <div className="text-destructive">Storage bucket "guest_ids" not found. Create a storage bucket named <strong>guest_ids</strong> in your Supabase project (private) to store attachments.</div>;
    }
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
                        <th className="p-2">Registered By</th>
                      </tr>
            </thead>
            <tbody>
              {data?.map((g) => (
                <tr key={g.id} className="border-b">
                  <td className="p-2">{g.full_name}</td>
                  <td className="p-2">{g.phone ?? '-'}</td>
                  <td className="p-2">{g.email ?? '-'}</td>
                  <td className="p-2">{g.id_number ?? '-'}</td>
                  <td className="p-2">{g.signedUrl ? <a className="text-primary underline" href={g.signedUrl} target="_blank" rel="noreferrer">View</a> : '-'}</td>
                  <td className="p-2">{g.purpose ?? '-'}</td>
                        <td className="p-2">{g.created_at ? new Date(g.created_at).toLocaleString() : '-'}</td>
                        <td className="p-2">{g.registrant_name ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
