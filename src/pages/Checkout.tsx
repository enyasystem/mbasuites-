import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePaystackPayment } from "react-paystack";
import { loadStripe } from "@stripe/stripe-js";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useBooking } from "@/contexts/BookingContext";
import { useLocation } from "@/context/LocationContext";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Wallet } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  specialRequests: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

// Initialize Stripe (test mode)
const stripePromise = loadStripe("pk_test_51PXxxxxxxxxxxxxxYourStripeKeyHere");

type PaymentMethod = "paystack" | "stripe";

export default function Checkout() {
  const navigate = useNavigate();
  const { bookingData } = useBooking();
  const { location } = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    location === "Lagos" ? "paystack" : "stripe"
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialRequests: "",
      agreeToTerms: false,
    },
  });

  // Update suggested payment method when location changes
  useEffect(() => {
    setPaymentMethod(location === "Lagos" ? "paystack" : "stripe");
  }, [location]);
  // Paystack configuration - TEST MODE
  const paystackConfig = {
    reference: `booking_${new Date().getTime()}`,
    email: form.watch("email") || "guest@example.com",
    amount: (bookingData?.totalPrice ?? 0) * 100, // Paystack expects amount in kobo (lowest currency unit)
    publicKey: "pk_test_xxxxxxxxxxxxx", // Replace with actual test key
  };

  // Initialize Paystack payment hook unconditionally to satisfy Hooks rules
  const initializePayment = usePaystackPayment(paystackConfig);

  // Redirect if no booking data
  if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">No Booking Selected</h1>
          <p className="text-muted-foreground mb-8">
            Please select a room and dates to proceed with checkout.
          </p>
          <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
        </div>
        <Footer />
      </div>
    );
  }

  type PaystackReference = { reference?: string };

  const onSuccess = (reference: PaystackReference) => {
    console.log("Payment successful:", reference);
    setIsProcessing(false);
    toast({
      title: "Payment Successful!",
      description: "Your booking has been confirmed.",
    });
    navigate("/confirmation", {
      state: {
        bookingReference: reference.reference,
        guestInfo: form.getValues(),
        bookingData,
      },
    });
  };

  const onClose = () => {
    setIsProcessing(false);
    toast({
      title: "Payment Cancelled",
      description: "Your payment was not completed.",
      variant: "destructive",
    });
  };

  const handleStripePayment = async (data: FormData) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // In a real app, you'd create a payment intent on your backend
      // For now, simulate successful payment
      setTimeout(() => {
        setIsProcessing(false);
        const bookingRef = `STR-${new Date().getTime()}`;
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed.",
        });
        navigate("/confirmation", {
          state: {
            bookingReference: bookingRef,
            guestInfo: data,
            bookingData,
          },
        });
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: FormData) => {
    setIsProcessing(true);
    
    if (paymentMethod === "paystack") {
      // Update Paystack config with the submitted email
      initializePayment({ onSuccess, onClose });
    } else {
      handleStripePayment(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Guest Information Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Guest Information</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <motion.div whileFocus={{ scale: 1.01 }}>
                                <Input 
                                  placeholder="John" 
                                  className="transition-all focus:ring-2 focus:ring-accent" 
                                  {...field} 
                                />
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <motion.div whileFocus={{ scale: 1.01 }}>
                                <Input 
                                  placeholder="Doe" 
                                  className="transition-all focus:ring-2 focus:ring-accent" 
                                  {...field} 
                                />
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <Input 
                                type="email" 
                                placeholder="john.doe@example.com" 
                                className="transition-all focus:ring-2 focus:ring-accent" 
                                {...field} 
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <Input 
                                type="tel" 
                                placeholder="+234 800 000 0000" 
                                className="transition-all focus:ring-2 focus:ring-accent" 
                                {...field} 
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests (Optional)</FormLabel>
                          <FormControl>
                            <motion.div whileFocus={{ scale: 1.01 }}>
                              <Textarea
                                placeholder="Any special requests or requirements..."
                                className="min-h-[100px] transition-all focus:ring-2 focus:ring-accent"
                                {...field}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Payment Method Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <label className="text-sm font-medium">Payment Method</label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Label
                          htmlFor="paystack"
                          className={`flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition-all p-4 ${
                            paymentMethod === "paystack"
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/50"
                          }`}
                        >
                          <RadioGroupItem value="paystack" id="paystack" className="sr-only" />
                          <Wallet className="h-8 w-8 mb-2" />
                          <span className="font-semibold">Paystack</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Recommended for Nigeria
                          </span>
                        </Label>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Label
                          htmlFor="stripe"
                          className={`flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition-all p-4 ${
                            paymentMethod === "stripe"
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/50"
                          }`}
                        >
                          <RadioGroupItem value="stripe" id="stripe" className="sr-only" />
                          <CreditCard className="h-8 w-8 mb-2" />
                          <span className="font-semibold">Stripe</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            International cards
                          </span>
                        </Label>
                      </motion.div>
                    </RadioGroup>
                  </motion.div>

                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the terms and conditions
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing && (
                        <motion.div
                          className="absolute inset-0 bg-accent/20"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <span className="relative">
                        {isProcessing ? "Processing..." : "Proceed to Payment"}
                      </span>
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-2xl font-semibold mb-6">Booking Summary</h2>

              <div className="space-y-4">
                <div>
                  <img
                    src={bookingData.room.images[0]}
                    alt={bookingData.room.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-lg">{bookingData.room.name}</h3>
                  <p className="text-sm text-muted-foreground">{bookingData.room.category}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">
                      {format(bookingData.checkIn, "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">
                      {format(bookingData.checkOut, "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nights</span>
                    <span className="font-medium">{bookingData.nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">
                      {bookingData.guests.adults} adult{bookingData.guests.adults !== 1 ? "s" : ""}
                      {bookingData.guests.children > 0 && `, ${bookingData.guests.children} child${bookingData.guests.children !== 1 ? "ren" : ""}`}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₦{bookingData.room.price.toLocaleString()} × {bookingData.nights} nights
                    </span>
                    <span>₦{(bookingData.room.price * bookingData.nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>₦0</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{bookingData.totalPrice.toLocaleString()}</span>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg mt-4">
                  <p className="text-xs text-muted-foreground">
                    💳 Payment is processed securely via{" "}
                    {paymentMethod === "paystack" ? "Paystack" : "Stripe"} (Test Mode)
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
