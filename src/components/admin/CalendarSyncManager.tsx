import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Plus, Trash2, ExternalLink, Calendar, Copy } from "lucide-react";
import { format } from "date-fns";

interface ExternalCalendar {
  id: string;
  room_id: string;
  platform: string;
  ical_url: string;
  last_synced_at: string | null;
  sync_enabled: boolean;
  created_at: string;
}

interface Room {
  id: string;
  title: string;
  room_number: string;
}

export default function CalendarSyncManager() {
  const [calendars, setCalendars] = useState<ExternalCalendar[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCalendar, setNewCalendar] = useState({
    room_id: "",
    platform: "airbnb",
    ical_url: "",
  });

  const supabaseUrl = "https://vedsoyletjvbjfrcbasy.supabase.co";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [calendarsRes, roomsRes] = await Promise.all([
        supabase.from('external_calendars').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('id, title, room_number'),
      ]);

      if (calendarsRes.error) throw calendarsRes.error;
      if (roomsRes.error) throw roomsRes.error;

      setCalendars(calendarsRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCalendar = async () => {
    if (!newCalendar.room_id || !newCalendar.ical_url) {
      toast({
        title: "Missing Information",
        description: "Please select a room and enter an iCal URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('external_calendars')
        .insert(newCalendar);

      if (error) throw error;

      toast({
        title: "Calendar Added",
        description: "External calendar has been linked successfully",
      });

      setNewCalendar({ room_id: "", platform: "airbnb", ical_url: "" });
      setShowAddForm(false);
      fetchData();
    } catch (error: any) {
      console.error('Error adding calendar:', error);
      toast({
        title: "Error",
        description: "Failed to add calendar",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCalendar = async (id: string) => {
    try {
      const { error } = await supabase
        .from('external_calendars')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Calendar Removed",
        description: "External calendar has been unlinked",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting calendar:', error);
      toast({
        title: "Error",
        description: "Failed to remove calendar",
        variant: "destructive",
      });
    }
  };

  const handleToggleSync = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('external_calendars')
        .update({ sync_enabled: enabled })
        .eq('id', id);

      if (error) throw error;

      setCalendars(prev =>
        prev.map(c => c.id === id ? { ...c, sync_enabled: enabled } : c)
      );
    } catch (error: any) {
      console.error('Error toggling sync:', error);
    }
  };

  const handleSyncCalendar = async (calendarId: string) => {
    setIsSyncing(calendarId);
    try {
      const { data, error } = await supabase.functions.invoke('sync-calendars', {
        body: { action: 'sync_one', calendar_id: calendarId },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Imported ${data.eventsImported} blocked dates`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error syncing calendar:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync calendar",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing('all');
    try {
      const { data, error } = await supabase.functions.invoke('sync-calendars', {
        body: { action: 'sync_all' },
      });

      if (error) throw error;

      const successful = data.results?.filter((r: any) => r.success).length || 0;
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${successful} calendars`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error syncing all:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync calendars",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(null);
    }
  };

  const copyExportUrl = (roomId: string) => {
    const url = `${supabaseUrl}/functions/v1/sync-calendars?action=export_ical&room_id=${roomId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "iCal export URL copied to clipboard. Use this in Booking.com or Airbnb.",
    });
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? `${room.title} (${room.room_number})` : 'Unknown Room';
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      'airbnb': 'bg-rose-500',
      'booking.com': 'bg-blue-600',
      'vrbo': 'bg-indigo-500',
      'other': 'bg-gray-500',
    };
    return (
      <Badge className={`${colors[platform] || colors.other} text-white`}>
        {platform}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                External Calendar Sync
              </CardTitle>
              <CardDescription>
                Sync with Booking.com, Airbnb, and other platforms to prevent double-bookings
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSyncAll}
                disabled={isSyncing === 'all'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing === 'all' ? 'animate-spin' : ''}`} />
                Sync All
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Calendar
              </Button>
            </div>
          </div>
        </CardHeader>

        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
              <div>
                <Label>Room</Label>
                <Select
                  value={newCalendar.room_id}
                  onValueChange={(v) => setNewCalendar(prev => ({ ...prev, room_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.title} ({room.room_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Platform</Label>
                <Select
                  value={newCalendar.platform}
                  onValueChange={(v) => setNewCalendar(prev => ({ ...prev, platform: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                    <SelectItem value="booking.com">Booking.com</SelectItem>
                    <SelectItem value="vrbo">VRBO</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>iCal URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCalendar.ical_url}
                    onChange={(e) => setNewCalendar(prev => ({ ...prev, ical_url: e.target.value }))}
                    placeholder="https://..."
                  />
                  <Button onClick={handleAddCalendar}>Add</Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent>
          {calendars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No external calendars linked yet.</p>
              <p className="text-sm">Add iCal URLs from Booking.com or Airbnb to sync availability.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Last Synced</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendars.map(calendar => (
                  <TableRow key={calendar.id}>
                    <TableCell className="font-medium">
                      {getRoomName(calendar.room_id)}
                    </TableCell>
                    <TableCell>{getPlatformBadge(calendar.platform)}</TableCell>
                    <TableCell>
                      {calendar.last_synced_at
                        ? format(new Date(calendar.last_synced_at), 'MMM d, yyyy h:mm a')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={calendar.sync_enabled}
                        onCheckedChange={(checked) => handleToggleSync(calendar.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncCalendar(calendar.id)}
                          disabled={isSyncing === calendar.id}
                        >
                          <RefreshCw className={`h-4 w-4 ${isSyncing === calendar.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(calendar.ical_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCalendar(calendar.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Export URLs for each room */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Calendar</CardTitle>
          <CardDescription>
            Use these iCal URLs to sync your bookings to Booking.com and Airbnb
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rooms.map(room => (
              <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{room.title}</p>
                  <p className="text-sm text-muted-foreground">Room {room.room_number}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyExportUrl(room.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy iCal URL
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
