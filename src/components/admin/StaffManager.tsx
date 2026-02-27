import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLocations } from "@/hooks/useLocations";
import { toast } from "sonner";
import { UserPlus, Edit2, Trash2, Search, Shield, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface StaffMember {
  id: string;
  user_id: string;
  role: "admin" | "staff" | "guest";
  location_id: string | null;
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
    phone: string | null;
  };
  location?: {
    name: string;
  };
}

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "staff" as "admin" | "staff" | "guest",
    location_id: ""
  });
  
  const { locations } = useLocations();

  const getErrorMessage = (e: unknown): string => {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  };

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('role', ['admin', 'staff'])
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;
      
      if (!rolesData || rolesData.length === 0) {
        setStaff([]);
        return;
      }

      // Fetch related profiles
      const userIds = [...new Set(rolesData.map((r: { user_id: string }) => r.user_id))];
      const locationIds = [...new Set(rolesData.map((r: { location_id?: string | null }) => r.location_id).filter(Boolean))];

      type Profile = { id: string; email?: string | null; full_name?: string | null; phone?: string | null };
      type LocationSmall = { id: string; name?: string };

      const profilesPromise = supabase.from<Profile>('profiles').select('id, email, full_name, phone').in('id', userIds as string[]);
      const locationsPromise = locationIds.length > 0
        ? supabase.from<LocationSmall>('locations').select('id, name').in('id', locationIds as string[])
        : Promise.resolve({ data: [] as LocationSmall[] } as const);

      const [profilesRes, locationsRes] = await Promise.all([profilesPromise, locationsPromise]);

      const profilesMap = (profilesRes.data || []).reduce((acc, p) => {
        acc[p.id] = { email: p.email ?? '', full_name: p.full_name ?? null, phone: p.phone ?? null };
        return acc;
      }, {} as Record<string, { email: string; full_name: string | null; phone: string | null }>);

      const locationsMap = (locationsRes.data || []).reduce((acc, l) => {
        acc[l.id] = { name: l.name ?? '' };
        return acc;
      }, {} as Record<string, { name: string }>);

      const transformedData: StaffMember[] = rolesData.map(item => ({
        ...item,
        profile: profilesMap[item.user_id],
        location: item.location_id ? locationsMap[item.location_id] : undefined
      }));
      
      setStaff(transformedData);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error(getErrorMessage(error) || 'Failed to load staff members');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStaff();
  }, [fetchStaff]);

  const handleAddStaff = async () => {
    try {
      // First, find the user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', formData.email)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile) {
        toast.error('User not found. They must sign up first.');
        return;
      }

      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profile.id)
        .eq('role', formData.role)
        .maybeSingle();

      if (existingRole) {
        toast.error('User already has this role');
        return;
      }

      // Add the role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.id,
          role: formData.role,
          location_id: formData.location_id || null
        });

      if (error) throw error;

      toast.success('Staff member added successfully');
      setIsAddDialogOpen(false);
      setFormData({ email: "", role: "staff", location_id: "" });
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error(getErrorMessage(error) || 'Failed to add staff member');
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          role: formData.role,
          location_id: formData.location_id || null
        })
        .eq('id', editingStaff.id);

      if (error) throw error;

      toast.success('Staff member updated successfully');
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error(getErrorMessage(error) || 'Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      toast.success('Staff role removed successfully');
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error(getErrorMessage(error) || 'Failed to remove staff role');
    }
  };

  const filteredStaff = staff.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.profile?.email?.toLowerCase().includes(searchLower) ||
      member.profile?.full_name?.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'staff':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">Manage admin and staff roles</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  User must have an existing account
                </p>
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "staff") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Assigned Location (Optional)</Label>
                <Select
                  value={formData.location_id || "all"}
                  onValueChange={(value) => setFormData({ ...formData, location_id: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.length > 0 && Object.entries(
                      locations.reduce((groups, loc) => {
                        const country = loc.country;
                        const city = loc.city;
                        if (!groups[country]) groups[country] = {};
                        if (!groups[country][city]) groups[country][city] = [];
                        groups[country][city].push(loc);
                        return groups;
                      }, {} as Record<string, Record<string, typeof locations>>)
                    ).map(([country, cities]) => (
                      <div key={`group-${country}`}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-foreground bg-muted">
                          {country}
                        </div>
                        {Object.entries(cities).map(([city, cityLocations]) => (
                          <div key={`subgroup-${city}`}>
                            <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                              {city}
                            </div>
                            {(cityLocations as typeof locations).map((loc) => (
                              <SelectItem key={loc.id} value={loc.id} className="pl-8">
                                {loc.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleAddStaff} className="w-full">
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Staff Table */}
      <Card>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No staff members found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Add your first staff member to get started'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.profile?.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{member.profile?.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.location?.name || 'All locations'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingStaff?.id === member.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setEditingStaff(member);
                            setFormData({
                              email: member.profile?.email || "",
                              role: member.role as "admin" | "staff",
                              location_id: member.location_id || ""
                            });
                          } else {
                            setEditingStaff(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Staff Member</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Email</Label>
                              <Input value={member.profile?.email} disabled />
                            </div>
                            
                            <div>
                              <Label htmlFor="edit-role">Role</Label>
                              <Select
                                value={formData.role}
                                onValueChange={(value: "admin" | "staff") => 
                                  setFormData({ ...formData, role: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="edit-location">Assigned Location</Label>
                              <Select
                                value={formData.location_id || "all"}
                                onValueChange={(value) => 
                                  setFormData({ ...formData, location_id: value === "all" ? "" : value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="All locations" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All locations</SelectItem>
                                  {locations.length > 0 && Object.entries(
                                    locations.reduce((groups, loc) => {
                                      const country = loc.country;
                                      const city = loc.city;
                                      if (!groups[country]) groups[country] = {};
                                      if (!groups[country][city]) groups[country][city] = [];
                                      groups[country][city].push(loc);
                                      return groups;
                                    }, {} as Record<string, Record<string, typeof locations>>)
                                  ).map(([country, cities]) => (
                                    <div key={`group-${country}`}>
                                      <div className="px-2 py-1.5 text-sm font-semibold text-foreground bg-muted">
                                        {country}
                                      </div>
                                      {Object.entries(cities).map(([city, cityLocations]) => (
                                        <div key={`subgroup-${city}`}>
                                          <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                                            {city}
                                          </div>
                                          {(cityLocations as typeof locations).map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id} className="pl-8">
                                              {loc.name}
                                            </SelectItem>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <Button onClick={handleUpdateStaff} className="w-full">
                              Update Staff Member
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Staff Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove the {member.role} role from {member.profile?.email}? 
                              This will revoke their access to admin features.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteStaff(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
