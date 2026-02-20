import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedInput } from "@/components/ui/animated-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { LoyaltyPoints } from "@/components/LoyaltyPoints";
import { EmailPreferences } from "@/components/EmailPreferences";
import { Calendar, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useUserBookings } from "@/hooks/useUserBookings";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;


const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    register,
    formState: { errors, dirtyFields },
    reset,
    getValues,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  // Fetch bookings for the signed-in user
  const { bookings, isLoading } = useUserBookings();

  // Loyalty points feature (currently coming soon)
  // const loyaltyPoints = 2750; // Mock loyalty points
  // const tier = loyaltyPoints >= 5000 ? "Platinum" : loyaltyPoints >= 2500 ? "Gold" : loyaltyPoints >= 1000 ? "Silver" : "Bronze";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || "",
        address: user.user_metadata?.address || "",
      });
    }
  }, [user, reset]);

  // Handle profile save to database
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const formValues = getValues();

      // Update Supabase profiles table
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formValues.fullName,
          phone: formValues.phone,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      // Also update user metadata for full_name
      await supabase.auth.updateUser({
        data: {
          full_name: formValues.fullName,
          phone: formValues.phone,
          address: formValues.address,
        },
      });

      setLastSaved(new Date());
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Clear lastSaved indicator after 3 seconds
  useEffect(() => {
    if (lastSaved) {
      const timer = setTimeout(() => setLastSaved(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

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

  const upcomingBookings = (bookings || []).filter((b) => b.status === "pending" || b.status === "confirmed");
  const pastBookings = (bookings || []).filter((b) => b.status === "completed");

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
                {isLoading ? (
                  <Card>
                    <CardContent className="p-6 text-center">Loading bookings...</CardContent>
                  </Card>
                ) : upcomingBookings.length === 0 ? (
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
                              <CardTitle>{booking.room?.title || "Room"}</CardTitle>
                              <CardDescription>Booking ID: {booking.id}</CardDescription>
                            </div>
                            <Badge variant="secondary">{booking.status === "pending" ? "Pending" : "Upcoming"}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.check_in_date), "MMM dd, yyyy")} - {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{booking.num_guests} guests</span>
                              <span className="font-semibold">${booking.total_amount}</span>
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
                {isLoading ? (
                  <Card>
                    <CardContent className="p-6 text-center">Loading bookings...</CardContent>
                  </Card>
                ) : pastBookings.length === 0 ? (
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
                              <CardTitle>{booking.room?.title || "Room"}</CardTitle>
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
                                {format(new Date(booking.check_in_date), "MMM dd, yyyy")} - {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{booking.num_guests} guests</span>
                              <span className="font-semibold">${booking.total_amount}</span>
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
                      <CardDescription>Update your profile details</CardDescription>
                    </div>
                    <AnimatePresence>
                      {lastSaved && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Saved</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
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

                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving || !Object.keys(dirtyFields).length}
                      className="w-full"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards">
              <Card>
                <CardContent className="p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">Our rewards program is currently being developed and will be available soon</p>
                  </motion.div>
                </CardContent>
              </Card>
              {/* Uncomment when loyalty points feature is ready
              <LoyaltyPoints totalPoints={loyaltyPoints} tier={tier} />
              */}
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
