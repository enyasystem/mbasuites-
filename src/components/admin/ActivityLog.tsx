import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, RefreshCw, Activity, User, Calendar, FileText, Building2, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ActivityLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  } | null;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  confirm: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  cancel: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  complete: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  login: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  signup: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  sync: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  booking: Calendar,
  room: Building2,
  user: User,
  payment: CreditCard,
  calendar: RefreshCw,
  default: FileText,
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  const fetchLogs = async (reset = false) => {
    if (reset) {
      setPage(0);
      setLogs([]);
    }
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(reset ? 0 : page * pageSize, (reset ? 0 : page) * pageSize + pageSize - 1);

      if (entityFilter !== "all") {
        query = query.eq('entity_type', entityFilter);
      }
      
      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles for users who have activity
      const userIds = [...new Set((data || []).map(d => d.user_id).filter(Boolean))];
      let profilesMap: Record<string, { email: string; full_name: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);
        
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = { email: p.email, full_name: p.full_name };
          return acc;
        }, {} as Record<string, { email: string; full_name: string | null }>);
      }

      const transformedData: ActivityLogEntry[] = (data || []).map(item => ({
        ...item,
        details: item.details as Record<string, any> | null,
        profile: item.user_id ? profilesMap[item.user_id] || null : null
      }));

      if (reset) {
        setLogs(transformedData);
      } else {
        setLogs(prev => [...prev, ...transformedData]);
      }
      
      setHasMore((data || []).length === pageSize);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
  }, [entityFilter, actionFilter]);

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchLogs();
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      log.profile?.email?.toLowerCase().includes(searchLower) ||
      log.profile?.full_name?.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.details).toLowerCase().includes(searchLower)
    );
  });

  const getEntityIcon = (entityType: string) => {
    const Icon = ENTITY_ICONS[entityType] || ENTITY_ICONS.default;
    return <Icon className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    for (const [key, value] of Object.entries(ACTION_COLORS)) {
      if (lowerAction.includes(key)) return value;
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Activity Log</h2>
          <p className="text-muted-foreground">Track all system activities</p>
        </div>
        
        <Button variant="outline" onClick={() => fetchLogs(true)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              <SelectItem value="booking">Bookings</SelectItem>
              <SelectItem value="room">Rooms</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="calendar">Calendars</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="confirm">Confirm</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Activity List */}
      <Card>
        {isLoading && logs.length === 0 ? (
          <div className="p-6 space-y-4">
            {Array(10).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No activity found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Activity will appear here as actions are performed'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                    {getEntityIcon(log.entity_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium capitalize">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.entity_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {Object.entries(log.details)
                          .filter(([_, v]) => v !== null && v !== undefined)
                          .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                          .join(' • ')}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {log.profile && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.profile.full_name || log.profile.email}
                        </span>
                      )}
                      <span>
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                      {log.ip_address && (
                        <span className="font-mono">{log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {hasMore && !isLoading && filteredLogs.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
        
        {isLoading && logs.length > 0 && (
          <div className="p-4 border-t border-border">
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </Card>
    </div>
  );
}
