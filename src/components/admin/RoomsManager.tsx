import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Building2, Upload, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { useAdminRooms, DatabaseRoom } from "@/hooks/useAdminRooms";
import { useLocations } from "@/hooks/useLocations";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 10;

const allAmenities = [
  "WiFi",
  "Air Conditioning",
  "Mini Bar",
  "Room Service",
  "TV",
  "Safe",
  "Balcony",
  "City View",
  "Ocean View",
  "Jacuzzi",
  "Kitchen",
  "Work Desk",
];

const roomSchema = z.object({
  title: z.string().min(3, "Name must be at least 3 characters"),
  room_number: z.string().min(1, "Room number is required"),
  room_type: z.enum(["standard", "deluxe", "suite"]),
  price_per_night: z.coerce.number().min(1, "Price must be greater than 0"),
  max_guests: z.coerce.number().min(1, "Must accommodate at least 1 guest"),
  amenities: z.array(z.string()),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_available: z.boolean(),
  location_id: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

export default function RoomsManager({ allowedLocationIds }: { allowedLocationIds?: string[] }) {
  const { rooms, isLoading, addRoom, updateRoom, deleteRoom, toggleAvailability, addRoomImages, removeRoomImage } = useAdminRooms();
  const { locations } = useLocations();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "add" | "edit">("list");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<DatabaseRoom | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const { formatPrice, formatLocalPrice } = useCurrency();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      title: "",
      room_number: "",
      room_type: "standard",
      price_per_night: 0,
      max_guests: 2,
      amenities: [],
      image_url: "",
      description: "",
      is_available: true,
      location_id: "",
    },
  });

  // Persist form draft to localStorage
  const DRAFT_STORAGE_KEY = "rooms-manager-form-draft";
  const DRAFT_MODE_KEY = "rooms-manager-form-mode";

  const saveDraftToStorage = useCallback(() => {
    if (viewMode !== "list") {
      const formData = form.getValues();
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem(DRAFT_MODE_KEY, viewMode);
    }
  }, [form, viewMode]);

  const clearDraftFromStorage = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_MODE_KEY);
  }, []);

  // Auto-save form changes to localStorage
  useEffect(() => {
    const subscription = form.watch(() => {
      saveDraftToStorage();
    });
    return () => subscription.unsubscribe();
  }, [form, saveDraftToStorage]);

  // Restore form draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    const savedMode = localStorage.getItem(DRAFT_MODE_KEY) as "add" | "edit" | null;
    if (savedDraft && savedMode) {
      try {
        const draftData = JSON.parse(savedDraft) as RoomFormData;
        form.reset(draftData);
        setViewMode(savedMode);
        // Try to restore selected room if in edit mode
        if (savedMode === "edit" && draftData.title) {
          const roomToEdit = rooms.find(r => r.title === draftData.title);
          if (roomToEdit) setSelectedRoom(roomToEdit);
        }
      } catch (e) {
        console.warn("Failed to restore form draft", e);
      }
    }
  }, []);


  // Filter and paginate rooms
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => !allowedLocationIds || allowedLocationIds.length === 0 || !room.location_id || allowedLocationIds.includes(room.location_id))
      .filter(
        (room) =>
          room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (room.location_name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [rooms, searchTerm, allowedLocationIds]);

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRooms.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRooms, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddRoom = async (data: RoomFormData) => {
    setIsSaving(true);
    try {
      // upload any new files first to get public URLs
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        uploadedUrls = await uploadFiles(newFiles);
      }

      // enforce allowed location
      if (allowedLocationIds && allowedLocationIds.length > 0 && data.location_id && !allowedLocationIds.includes(data.location_id)) {
        throw new Error("You are not allowed to add rooms for that location.");
      }

      await addRoom({
        title: data.title,
        room_number: data.room_number,
        room_type: data.room_type,
        price_per_night: data.price_per_night,
        max_guests: data.max_guests,
        amenities: data.amenities,
        image_url: data.image_url || null,
        description: data.description,
        is_available: data.is_available,
        location_id: data.location_id || null,
        image_urls: uploadedUrls,
      });
      clearDraftFromStorage();
      setViewMode("list");
      form.reset();
      setImagePreview("");
      setNewFiles([]);
      setNewFilePreviews([]);
      if (newFileInputRef.current) newFileInputRef.current.value = "";
      toast({ title: "Room Added", description: `${data.title} has been successfully added.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to add room", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRoom = async (data: RoomFormData) => {
    if (!selectedRoom) return;
    setIsSaving(true);
    try {
      // Upload new files first so we can pass their URLs to updateRoom in one operation
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        uploadedUrls = await uploadFiles(newFiles);
      }

      if (allowedLocationIds && allowedLocationIds.length > 0 && data.location_id && !allowedLocationIds.includes(data.location_id)) {
        throw new Error("You are not allowed to move rooms to that location.");
      }

      await updateRoom(selectedRoom.id, {
        title: data.title,
        room_number: data.room_number,
        room_type: data.room_type,
        price_per_night: data.price_per_night,
        max_guests: data.max_guests,
        amenities: data.amenities,
        image_url: data.image_url || null,
        description: data.description,
        is_available: data.is_available,
        location_id: data.location_id || null,
        ...(uploadedUrls.length > 0 ? { image_urls: uploadedUrls } : {}),
      });

      clearDraftFromStorage();
      setViewMode("list");
      setSelectedRoom(null);
      form.reset();
      setImagePreview("");
      setNewFiles([]);
      setNewFilePreviews([]);
      if (newFileInputRef.current) newFileInputRef.current.value = "";
      toast({ title: "Room Updated", description: `${data.title} has been successfully updated.` });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message || "Failed to update room", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.id);
      setIsDeleteDialogOpen(false);
      toast({ title: "Room Deleted", description: `${selectedRoom.title} has been deleted.`, variant: "destructive" });
      setSelectedRoom(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete room";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleToggleAvailability = async (room: DatabaseRoom) => {
    try {
      await toggleAvailability(room.id, room.is_available);
      toast({
        title: room.is_available ? "Room Marked Unavailable" : "Room Marked Available",
        description: `${room.title} is now ${!room.is_available ? "available" : "unavailable"}.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
    }
  };

  const openAddForm = () => {
    form.reset();
    setImagePreview("");
    setSelectedRoom(null);
    setNewFiles([]);
    setNewFilePreviews([]);
    if (newFileInputRef.current) newFileInputRef.current.value = "";
    setViewMode("add");
  };

  const openEditForm = (room: DatabaseRoom) => {
    setSelectedRoom(room);
    setImagePreview(room.image_url || "");
    form.reset({
      title: room.title,
      room_number: room.room_number,
      room_type: room.room_type,
      price_per_night: room.price_per_night,
      max_guests: room.max_guests,
      amenities: room.amenities || [],
      image_url: room.image_url || "",
      description: room.description || "",
      is_available: room.is_available,
      location_id: room.location_id || "",
    });
    setNewFiles([]);
    setNewFilePreviews([]);
    if (newFileInputRef.current) newFileInputRef.current.value = "";
    setViewMode("edit");
  };

  const openDeleteDialog = (room: DatabaseRoom) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image_url", result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multi-file handlers
  const handleNewFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const accepted: File[] = [];
    const previews: string[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} is larger than 5MB and was skipped.`, variant: "destructive" });
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length === 0) return;
    // generate previews
    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFilePreviews((p) => [...p, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setNewFiles((prev) => [...prev, ...accepted]);
    // clear the input so same files can be re-selected later
    if (newFileInputRef.current) newFileInputRef.current.value = "";
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return [];
    const urls: string[] = [];
    for (const file of files) {
      // ensure file path does not redundantly include the bucket id
      const filePath = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("room-images").upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("room-images").getPublicUrl(filePath);
      urls.push(publicUrlData.publicUrl);
    }
    return urls;
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    form.setValue("image_url", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    clearDraftFromStorage();
    setViewMode("list");
    setSelectedRoom(null);
    form.reset();
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-96" /></div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="p-4"><div className="space-y-3">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-16 w-full" />))}</div></Card>
      </div>
    );
  }

  // Room Form Component (inline)
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {viewMode === "add" ? "Add New Room" : "Edit Room"}
            </h2>
            <p className="text-muted-foreground">
              {viewMode === "add" ? "Fill in the details to add a new room." : "Update the room details below."}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(viewMode === "add" ? handleAddRoom : handleEditRoom)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl><Input placeholder="Deluxe King Room" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="room_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl><Input placeholder="101" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="room_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="deluxe">Deluxe</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="price_per_night" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Night</FormLabel>
                    <FormControl><Input type="number" placeholder="189" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="max_guests" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <FormControl><Input type="number" placeholder="2" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="amenities" render={() => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {allAmenities.map((amenity) => (
                      <FormField key={amenity} control={form.control} name="amenities" render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(amenity)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, amenity])
                                  : field.onChange(field.value?.filter((val) => val !== amenity));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{amenity}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="image_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Images</FormLabel>
                  <FormControl>
                    <div className="space-y-4">

                      {/* Existing images (edit mode) */}
                      {viewMode === "edit" && selectedRoom?.images && selectedRoom.images.length > 0 && (
                        <div>
                          <div className="mb-2 text-sm text-muted-foreground">Current Images</div>
                          <div className="grid grid-cols-3 gap-3">
                            {selectedRoom.images.map((img) => (
                              <div key={img.id} className="relative rounded overflow-hidden border border-border">
                                <img src={img.url} alt="Room image" className="h-24 w-full object-cover" />
                                <div className="absolute top-2 right-2 flex space-x-2">
                                  <Button size="sm" variant="destructive" onClick={async () => { try { setIsSaving(true); await removeRoomImage(img.id); toast({ title: "Image removed" }); } catch (err) { toast({ title: "Error", description: "Failed to remove image", variant: "destructive" }); } finally { setIsSaving(false); }}}><X className="h-3 w-3" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New uploads previews */}
                      {newFilePreviews.length > 0 && (
                        <div>
                          <div className="mb-2 text-sm text-muted-foreground">New Images</div>
                          <div className="grid grid-cols-3 gap-3">
                            {newFilePreviews.map((p, i) => (
                              <div key={i} className="relative rounded overflow-hidden border border-border">
                                <img src={p} alt={`Preview ${i}`} className="h-24 w-full object-cover" />
                                <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => { removeNewFile(i); }}><X className="h-3 w-3" /></Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 max-w-md">
                        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => newFileInputRef.current?.click()}>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to upload</span> or drag and drop</div>
                          <div className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB) — You can add multiple images</div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">or</div>
                        <Input placeholder="Enter image URL (one per line)" value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                      </div>

                      <input ref={newFileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple className="hidden" onChange={handleNewFilesSelected} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the room features..." rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="is_available" render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="font-normal">Mark as available for booking</FormLabel>
                </FormItem>
              )} />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Room"}</Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Rooms Management</h2>
        <p className="text-muted-foreground">Add, edit, or remove rooms from your inventory</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" />Add New Room
        </Button>
      </div>

      {filteredRooms.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
          <p className="text-muted-foreground mb-4">{searchTerm ? "Try adjusting your search" : "Get started by adding your first room"}</p>
          {!searchTerm && <Button onClick={openAddForm}><Plus className="h-4 w-4 mr-2" />Add First Room</Button>}
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Room #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Max Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.title}</TableCell>
                      <TableCell>{room.room_number}</TableCell>
                      <TableCell className="capitalize">{room.room_type}</TableCell>
                      <TableCell>{room.location_name}</TableCell>
                      <TableCell className="font-semibold">{formatLocalPrice(room.price_per_night)}</TableCell>
                      <TableCell>{room.max_guests}</TableCell>
                      <TableCell>
                        <Button variant={room.is_available ? "default" : "secondary"} size="sm" onClick={() => handleToggleAvailability(room)}>
                          {room.is_available ? "Available" : "Unavailable"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(room)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(room)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRooms.length)} of {filteredRooms.length} rooms
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next<ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete {selectedRoom?.title}. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
