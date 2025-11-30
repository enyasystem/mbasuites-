import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedInput } from "@/components/ui/animated-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoyaltyPoints } from "@/components/LoyaltyPoints";
import { EmailPreferences } from "@/components/EmailPreferences";
import { Calendar, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface MockBooking {
  id: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: "upcoming" | "completed" | "cancelled";
  totalPrice: number;
  guests: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    register,
    watch,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  // Mock data - in real app, fetch from database
  const [bookings] = useState<MockBooking[]>([
    {
      id: "1",
      roomName: "Deluxe King Room",
      checkIn: "2024-12-15",
      checkOut: "2024-12-18",
      status: "upcoming",
      totalPrice: 567,
      guests: 2,
    },
    {
      id: "2",
      roomName: "Executive Suite",
      checkIn: "2024-11-10",
      checkOut: "2024-11-13",
      status: "completed",
      totalPrice: 1047,
      guests: 3,
    },
  ]);

  const loyaltyPoints = 2750; // Mock loyalty points
  const tier = loyaltyPoints >= 5000 ? "Platinum" : loyaltyPoints >= 2500 ? "Gold" : loyaltyPoints >= 1000 ? "Silver" : "Bronze";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.user_metadata?.full_name || "",
        phone: "",
        address: "",
      });
    }
  }, [user, reset]);

  // Auto-save with debounce
  useEffect(() => {
    const subscription = watch((value) => {
      setAutoSaving(true);
      const timer = setTimeout(() => {
        // In real app, save to database
        setLastSaved(new Date());
        setAutoSaving(false);
        toast({
          title: "Auto-saved",
          description: "Your profile has been saved automatically",
        });
      }, 2000);

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");
  const pastBookings = bookings.filter((b) => b.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your bookings and profile</p>
          </div>

          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
                {upcomingBookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                      <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {upcomingBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{booking.roomName}</CardTitle>
                              <CardDescription>Booking ID: {booking.id}</CardDescription>
                            </div>
                            <Badge variant="secondary">Upcoming</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.checkIn), "MMM dd, yyyy")} - {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{booking.guests} guests</span>
                              <span className="font-semibold">${booking.totalPrice}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Past Bookings</h2>
                {pastBookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No past bookings
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {pastBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{booking.roomName}</CardTitle>
                              <CardDescription>Booking ID: {booking.id}</CardDescription>
                            </div>
                            <Badge>Completed</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.checkIn), "MMM dd, yyyy")} - {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{booking.guests} guests</span>
                              <span className="font-semibold">${booking.totalPrice}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Your changes are saved automatically</CardDescription>
                    </div>
                    <AnimatePresence>
                      {(autoSaving || lastSaved) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          {autoSaving ? (
                            <span className="text-muted-foreground">Saving...</span>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Saved</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatedInput
                      label="Full Name"
                      type="text"
                      error={errors.fullName?.message}
                      success={dirtyFields.fullName && !errors.fullName}
                      {...register("fullName")}
                    />

                    <div className="space-y-2">
                      <AnimatedInput
                        label="Email"
                        type="email"
                        value={user.email || ""}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <AnimatedInput
                      label="Phone Number"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      error={errors.phone?.message}
                      success={dirtyFields.phone && !errors.phone}
                      {...register("phone")}
                    />

                    <AnimatedInput
                      label="Address"
                      type="text"
                      placeholder="123 Main St, City, Country"
                      error={errors.address?.message}
                      success={dirtyFields.address && !errors.address}
                      {...register("address")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards">
              <LoyaltyPoints totalPoints={loyaltyPoints} tier={tier} />
            </TabsContent>

            <TabsContent value="notifications">
              <EmailPreferences />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
