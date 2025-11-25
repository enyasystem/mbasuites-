import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Search, Building2, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { rooms as initialRooms, allAmenities, allCategories } from "@/data/rooms";
import { Room } from "@/types/room";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";

const roomSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["single", "double", "king", "queen", "suite", "presidential"]),
  category: z.enum(["standard", "deluxe", "executive", "presidential"]),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  size: z.coerce.number().min(1, "Size must be greater than 0"),
  adultsCapacity: z.coerce.number().min(1, "Must accommodate at least 1 adult"),
  childrenCapacity: z.coerce.number().min(0, "Cannot be negative"),
  bedType: z.string().min(1, "Bed type is required"),
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  images: z.string().url("Must be a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  available: z.boolean(),
});

type RoomFormData = z.infer<typeof roomSchema>;

export default function RoomsManager() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      type: "single",
      category: "standard",
      price: 0,
      size: 0,
      adultsCapacity: 1,
      childrenCapacity: 0,
      bedType: "",
      amenities: [],
      images: "",
      description: "",
      available: true,
    },
  });

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoom = (data: RoomFormData) => {
    const newRoom: Room = {
      id: String(rooms.length + 1),
      name: data.name,
      type: data.type,
      category: data.category,
      price: data.price,
      size: data.size,
      capacity: {
        adults: data.adultsCapacity,
        children: data.childrenCapacity,
      },
      bedType: data.bedType,
      amenities: data.amenities,
      images: [data.images],
      description: data.description,
      rating: 0,
      available: data.available,
    };

    setRooms([...rooms, newRoom]);
    setIsAddDialogOpen(false);
    form.reset();
    toast({
      title: "Room Added",
      description: `${newRoom.name} has been successfully added.`,
    });
  };

  const handleEditRoom = (data: RoomFormData) => {
    if (!selectedRoom) return;

    const updatedRoom: Room = {
      ...selectedRoom,
      name: data.name,
      type: data.type,
      category: data.category,
      price: data.price,
      size: data.size,
      capacity: {
        adults: data.adultsCapacity,
        children: data.childrenCapacity,
      },
      bedType: data.bedType,
      amenities: data.amenities,
      images: [data.images],
      description: data.description,
      available: data.available,
    };

    setRooms(rooms.map((r) => (r.id === selectedRoom.id ? updatedRoom : r)));
    setIsEditDialogOpen(false);
    setSelectedRoom(null);
    form.reset();
    toast({
      title: "Room Updated",
      description: `${updatedRoom.name} has been successfully updated.`,
    });
  };

  const handleDeleteRoom = () => {
    if (!selectedRoom) return;

    setRooms(rooms.filter((r) => r.id !== selectedRoom.id));
    setIsDeleteDialogOpen(false);
    toast({
      title: "Room Deleted",
      description: `${selectedRoom.name} has been successfully deleted.`,
      variant: "destructive",
    });
    setSelectedRoom(null);
  };

  const handleToggleAvailability = (room: Room) => {
    setRooms(rooms.map((r) => (r.id === room.id ? { ...r, available: !r.available } : r)));
    toast({
      title: room.available ? "Room Marked Unavailable" : "Room Marked Available",
      description: `${room.name} is now ${!room.available ? "available" : "unavailable"}.`,
    });
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setImagePreview(room.images[0] || "");
    form.reset({
      name: room.name,
      type: room.type,
      category: room.category,
      price: room.price,
      size: room.size,
      adultsCapacity: room.capacity.adults,
      childrenCapacity: room.capacity.children,
      bedType: room.bedType,
      amenities: room.amenities,
      images: room.images[0] || "",
      description: room.description,
      available: room.available,
    });
    setIsEditDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("images", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    form.setValue("images", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openDeleteDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const RoomFormDialog = ({
    open,
    onOpenChange,
    onSubmit,
    title,
    description,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: RoomFormData) => void;
    title: string;
    description: string;
  }) => (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      handleDialogClose(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Deluxe King Room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="king">King</SelectItem>
                        <SelectItem value="queen">Queen</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                        <SelectItem value="presidential">Presidential</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="189" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adultsCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="childrenCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bedType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bed Type</FormLabel>
                  <FormControl>
                    <Input placeholder="King Bed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {allAmenities.map((amenity) => (
                      <FormField
                        key={amenity}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
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
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imagePreview ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                          <img
                            src={imagePreview}
                            alt="Room preview"
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div
                            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center hover:bg-muted/80 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">Click to upload</span> or
                              drag and drop
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PNG, JPG, WEBP (max 5MB)
                            </div>
                          </div>
                          <div className="text-center text-sm text-muted-foreground">or</div>
                          <Input
                            placeholder="Enter image URL"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value) {
                                setImagePreview(e.target.value);
                              }
                            }}
                          />
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the room features and amenities..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Mark as available for booking</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Room</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
        </div>
        <Card className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Rooms Management</h2>
        <p className="text-muted-foreground">Add, edit, or remove rooms from your inventory</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Room
        </Button>
      </div>

      {filteredRooms.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search to find what you're looking for"
              : "Get started by adding your first room"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Room
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="capitalize">{room.type}</TableCell>
                    <TableCell className="capitalize">{room.category}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(room.price)}</TableCell>
                    <TableCell>{room.size}m²</TableCell>
                    <TableCell>
                      {room.capacity.adults}A / {room.capacity.children}C
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={room.available ? "default" : "secondary"}
                        size="sm"
                        onClick={() => handleToggleAvailability(room)}
                      >
                        {room.available ? "Available" : "Unavailable"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(room)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <RoomFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddRoom}
        title="Add New Room"
        description="Fill in the details to add a new room to your inventory."
      />

      <RoomFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditRoom}
        title="Edit Room"
        description="Update the room details below."
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedRoom?.name}. This action cannot be undone.
            </AlertDialogDescription>
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
