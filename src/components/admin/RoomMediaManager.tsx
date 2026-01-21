import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Upload, Trash2, Image, Video, Grip, Plus, X, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoomMedia {
  id: string;
  room_id: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  title: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

interface Room {
  id: string;
  title: string;
  location_name: string;
}

// Supabase row shape for the rooms select used above
interface SupabaseRoomRow {
  id: string;
  title: string;
  locations?: { name?: string } | null;
}

export default function RoomMediaManager() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    media_type: "image" as "image" | "video" | "360",
  });
  const queryClient = useQueryClient();

  // Fetch rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["admin-rooms-for-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, title, locations(name)")
        .order("title");
      if (error) throw error;
      return (data || []).map((r: SupabaseRoomRow) => ({
        id: r.id,
        title: r.title,
        location_name: r.locations?.name || "Unknown",
      })) as Room[];
    },
  });

  // Fetch media for selected room
  const { data: mediaItems = [], isLoading: mediaLoading } = useQuery({
    queryKey: ["room-media", selectedRoom],
    queryFn: async () => {
      if (!selectedRoom) return [];
      // supabase types may not include the `room_media` table in the generated Database type.
      // Use a local cast and disable the explicit-any rule for this call only.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("room_media")
        .select("*")
        .eq("room_id", selectedRoom)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as RoomMedia[];
    },
    enabled: !!selectedRoom,
  });

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (media: RoomMedia) => {
      // Extract file path from URL
      const url = new URL(media.media_url);
      const pathParts = url.pathname.split("/storage/v1/object/public/room-media/");
      if (pathParts[1]) {
        await supabase.storage.from("room-media").remove([pathParts[1]]);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("room_media").delete().eq("id", media.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-media", selectedRoom] });
      toast.success("Media deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete media: " + (error as Error).message);
    },
  });

  // Set primary mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      // First unset all primary for this room
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("room_media")
        .update({ is_primary: false })
        .eq("room_id", selectedRoom);
      
      // Then set the new primary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("room_media")
        .update({ is_primary: true })
        .eq("id", mediaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-media", selectedRoom] });
      toast.success("Primary image updated");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedRoom) return;

    setUploading(true);
    try {
      // Determine starting display order
      const startOrder = mediaItems.length > 0 ? Math.max(...mediaItems.map((m) => m.display_order)) + 1 : 0;

      // Get current session token to call the server function
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // POST file to server function which uploads using the service role
        const formData = new FormData();
        formData.append('file', file);
        formData.append('room_id', selectedRoom);

        // Use proxied route for local/dev (vercel dev) to avoid cross-origin issues;
        // in production the Vercel rewrite forwards `/functions/upload-room-media` to Supabase.
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

        // Try proxied route first (works when running `vercel dev` or in production with Vercel rewrite).
        // If that returns 404, fall back to calling the Supabase functions endpoint directly.
        const proxiedUrl = '/functions/upload-room-media';
        const directUrl = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/upload-room-media`;

        console.debug('upload-room-media: attempting proxied function URL', proxiedUrl);

        let res = await fetch(proxiedUrl, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.status === 404) {
          console.warn('upload-room-media: proxied route returned 404, falling back to direct Supabase URL', directUrl);
          res = await fetch(directUrl, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
        }

        // Read raw text and attempt JSON parse; provide helpful diagnostics on failure
        const raw = await res.text();
        type UploadResponse = { success?: boolean; publicUrl?: string; error?: string };
        let result: UploadResponse | null = null;
        if (raw) {
          try {
            result = JSON.parse(raw);
          } catch (err) {
            console.error('upload-room-media: response not JSON', { status: res.status, statusText: res.statusText, raw });
            throw new Error(`Upload failed: ${res.status} ${res.statusText} - invalid JSON response`);
          }
        }

        if (!res.ok) {
          const serverMsg = result?.error || raw || res.statusText;
          console.error('upload-room-media: server responded with error', { status: res.status, serverMsg, raw });
          throw new Error(`Upload failed: ${res.status} ${serverMsg}`);
        }

        if (!result?.success) {
          throw new Error(result?.error || 'Upload function returned unexpected response');
        }

        const publicUrl = result.publicUrl;
        const displayOrder = startOrder + i;

        // Insert metadata row
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: dbError } = await (supabase as any).from('room_media').insert({
          room_id: selectedRoom,
          media_type: uploadForm.media_type,
          media_url: publicUrl,
          title: uploadForm.title || file.name,
          display_order: displayOrder,
          is_primary: mediaItems.length === 0 && i === 0,
        });

        if (dbError) {
          const msg = ((dbError as unknown) as { message?: string })?.message || '';
          if (msg.includes('Could not find the table') || msg.includes('room_media')) {
            try {
              const { error: upErr } = await supabase.from('rooms').update({ image_url: publicUrl }).eq('id', selectedRoom);
              if (upErr) throw upErr;
              toast.success('Media uploaded and set as room image (fallback)');
              queryClient.invalidateQueries({ queryKey: ['room-media', selectedRoom] });
              setUploadDialogOpen(false);
              setUploadForm({ title: '', media_type: 'image' });
              break;
            } catch (err) {
              throw dbError;
            }
          }
          throw dbError;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["room-media", selectedRoom] });
      toast.success("Media uploaded successfully");
      setUploadDialogOpen(false);
      setUploadForm({ title: "", media_type: "image" });
    } catch (error) {
      toast.error("Upload failed: " + (error as Error).message);
    } finally {
      // clear the file input so same files can be selected again
      try {
        if (e.target) e.target.value = "";
      } catch (err) {
        // ignore
      }
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Room Media Gallery
          </CardTitle>
          <CardDescription>
            Manage photos and videos for each room. These will appear in the gallery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Selector */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Select Room</Label>
              <Select value={selectedRoom || ""} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a room to manage media..." />
                </SelectTrigger>
                <SelectContent>
                  {roomsLoading ? (
                    <div className="p-2">Loading rooms...</div>
                  ) : (
                    rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.title} - {room.location_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedRoom && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="sm:mt-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Media
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Media</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Title (optional)</Label>
                      <Input
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        placeholder="Enter media title..."
                      />
                    </div>
                    <div>
                      <Label>Media Type</Label>
                      <Select
                        value={uploadForm.media_type}
                        onValueChange={(v) => setUploadForm({ ...uploadForm, media_type: v as "image" | "video" | "360" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="360">360° View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Upload File</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          multiple
                          accept={uploadForm.media_type === "video" ? "video/*" : "image/*"}
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Uploading...
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Media Grid */}
          {selectedRoom && (
            <div className="mt-6">
              {mediaLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                  <Image className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No media uploaded for this room</p>
                  <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Image
                  </Button>
                </div>
              ) : (
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {mediaItems.map((media) => (
                      <motion.div
                        key={media.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
                      >
                        {media.media_type === "video" ? (
                          <video
                            src={media.media_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={media.media_url}
                            alt={media.title || "Room media"}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Primary badge */}
                        {media.is_primary && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                            Primary
                          </div>
                        )}

                        {/* Media type badge */}
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          {media.media_type === "video" ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <Image className="h-3 w-3" />
                          )}
                          {media.media_type}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!media.is_primary && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPrimaryMutation.mutate(media.id)}
                            >
                              Set Primary
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(media)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Title */}
                        {media.title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-sm truncate">{media.title}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          )}

          {!selectedRoom && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Select a room to manage its media gallery</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
