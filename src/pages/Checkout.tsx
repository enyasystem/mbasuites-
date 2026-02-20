import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePaystackPayment } from "react-paystack";
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
import { useLocation } from "@/context/useLocation";
import { useLocation as useRouterLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Wallet, Upload, X, FileImage, Loader2, Copy } from "lucide-react";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { supabase } from "@/integrations/supabase/client";
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

type PaymentMethod = "paystack" | "bank";

export default function Checkout() {
  const navigate = useNavigate();
  const { bookingData, clearBooking } = useBooking();
  const { selectedLocation } = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [promoCode, setPromoCode] = useState<string>("");
  type Promotion = {
    id: string;
    code?: string;
    discount_type?: "percentage" | "fixed" | string;
    discount_value?: number | string | null;
    current_uses?: number;
    max_uses?: number | null;
  } | null;

  const [appliedPromo, setAppliedPromo] = useState<Promotion>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNigeria = selectedLocation?.country === "Nigeria";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    isNigeria ? "paystack" : "bank"
  );

  const routerLocation = useRouterLocation();

  type RouterState = { formValues?: Partial<FormData> } | null;
  const incomingFormValues = (routerLocation.state as unknown as RouterState)?.formValues;
  const restoredFromLogin = !!incomingFormValues;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: incomingFormValues || {
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
    setPaymentMethod(isNigeria ? "paystack" : "bank");
  }, [isNigeria]);
  // Promo adjusted totals
  const promoDiscount = appliedPromo ? (() => {
    const total = bookingData?.totalPrice || 0;
    if (!appliedPromo) return 0;
    if (appliedPromo.discount_type === 'percentage') {
      return Math.round((Number(appliedPromo.discount_value) || 0) / 100 * total);
    }
    return Number(appliedPromo.discount_value) || 0;
  })() : 0;

  const adjustedTotal = Math.max(0, (bookingData?.totalPrice || 0) - promoDiscount);

  // Paystack configuration - TEST MODE (uses adjusted total)
  const paystackConfig = {
    reference: `booking_${new Date().getTime()}`,
    email: form.watch("email") || "guest@example.com",
    amount: (adjustedTotal) * 100, // Paystack expects amount in kobo (lowest currency unit)
    publicKey: "pk_test_xxxxxxxxxxxxx", // Replace with actual test key
  };

  // Initialize Paystack payment hook
  const initializePayment = usePaystackPayment(paystackConfig);

  // Payment settings from admin
  const { settings: paymentSettings, loading: paymentSettingsLoading, hasRows: paymentSettingsHasRows } = usePaymentSettings();

  // Determine if any payment methods are enabled from settings (only meaningful if rows exist)
  const anyPaymentEnabled = Boolean(
    paymentSettingsHasRows && (
      paymentSettings.paystack_enabled || paymentSettings.stripe_enabled || paymentSettings.bank_enabled
    )
  );

  // Show fallback options only when settings have been loaded but no rows exist in the table
  const showFallbackPaymentOptions = !paymentSettingsLoading && !paymentSettingsHasRows;

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

  // Require authentication before allowing booking
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-lg mx-auto p-8">
            <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              You must be logged in to complete a booking. Please sign in or create an account to continue.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => navigate('/login', { state: { returnTo: routerLocation.pathname + (routerLocation.search || ''), bookingData, formValues: form.getValues() } })}>Sign In / Sign Up</Button>
              <Button variant="ghost" onClick={() => navigate('/rooms')}>Browse Rooms</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  type PaystackReference = { reference?: string };

  const onSuccess = (reference: PaystackReference) => {
    (async () => {
      try {
        // Create booking record using adjusted total
        const { data: bookingResult, error: bookingErr } = await supabase.from('bookings').insert({
          user_id: user!.id,
          room_id: bookingData.room!.id,
          check_in_date: format(bookingData.checkIn!, 'yyyy-MM-dd'),
          check_out_date: format(bookingData.checkOut!, 'yyyy-MM-dd'),
          num_guests: bookingData.guests.adults + bookingData.guests.children,
          total_amount: adjustedTotal,
          status: 'confirmed',
          guest_name: `${form.getValues().firstName} ${form.getValues().lastName}`,
          guest_email: form.getValues().email,
          guest_phone: form.getValues().phone,
          currency: selectedLocation?.currency || 'NGN',
          notes: form.getValues().specialRequests || null,
        }).select().single();

        if (bookingErr) throw bookingErr;

        // Increment promo usage if applied
        if (appliedPromo) {
          try {
            await supabase.from('promotions').update({ current_uses: (appliedPromo.current_uses || 0) + 1 }).eq('id', appliedPromo.id);
          } catch (e) { console.warn('Failed to increment promo usage:', e); }
        }

        setIsProcessing(false);
        toast({ title: 'Payment Successful!', description: 'Your booking has been confirmed.' });
        navigate('/confirmation', { state: { bookingReference: reference.reference, guestInfo: form.getValues(), bookingData, isRestored: restoredFromLogin } });
      } catch (err) {
        console.error('Post-payment booking creation failed:', err);
        setIsProcessing(false);
        toast({ title: 'Booking Error', description: 'Payment succeeded but booking creation failed. Contact support.', variant: 'destructive' });
      }
    })();
  };

  const onClose = () => {
    setIsProcessing(false);
    toast({
      title: "Payment Cancelled",
      description: "Your payment was not completed.",
      variant: "destructive",
    });
  };

  // Stripe integration removed — bank transfer will be used as fallback for
  // non-Paystack payments.

  // Handle file selection for payment proof
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload an image or PDF file.",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setPaymentProofFile(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentProofPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPaymentProofPreview(null);
      }
    }
  };

  const removePaymentProof = () => {
    setPaymentProofFile(null);
    setPaymentProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBankTransferSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!paymentProofFile) {
      toast({
        title: "Payment Proof Required",
        description: "Please upload your payment proof before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload payment proof
      const fileExt = paymentProofFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProofFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const proofUrl = urlData.publicUrl;

      // Create booking (use adjusted total if promo applied)
      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          room_id: bookingData.room!.id,
          check_in_date: format(bookingData.checkIn!, 'yyyy-MM-dd'),
          check_out_date: format(bookingData.checkOut!, 'yyyy-MM-dd'),
          num_guests: bookingData.guests.adults + bookingData.guests.children,
          total_amount: adjustedTotal,
          status: 'pending',
          guest_name: `${data.firstName} ${data.lastName}`,
          guest_email: data.email,
          guest_phone: data.phone,
          currency: selectedLocation?.currency || 'NGN',
          notes: data.specialRequests || null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create bank payment request with proof
      const { error: paymentRequestError } = await supabase
        .from('bank_payment_requests')
        .insert({
          booking_id: bookingResult.id,
          amount: adjustedTotal,
          guest_name: `${data.firstName} ${data.lastName}`,
          guest_email: data.email,
          currency: selectedLocation?.currency || 'NGN',
          proof_url: proofUrl,
          status: 'pending',
        });

      if (paymentRequestError) throw paymentRequestError;

      // Clear booking data and navigate to confirmation
      // If a promo was applied, increment its usage count
      try {
        if (appliedPromo) {
          await supabase.from('promotions').update({ current_uses: (appliedPromo.current_uses || 0) + 1 }).eq('id', appliedPromo.id);
        }
      } catch (e) {
        console.warn('Failed to increment promo usage:', e);
      }

      clearBooking();
      
      toast({
        title: "Booking Submitted!",
        description: "Your booking is pending admin verification.",
      });

      navigate("/confirmation", {
        state: {
          bookingReference: `BANK-${bookingResult.id.slice(0, 8).toUpperCase()}`,
          guestInfo: data,
          bookingData,
          isPendingVerification: true,
          isRestored: restoredFromLogin,
        },
      });
    } catch (error: unknown) {
      console.error('Bank transfer submission error:', error);
      let msg = "There was an error submitting your booking.";
      if (error instanceof Error) {
        msg = error.message;
      } else if (error && typeof error === 'object') {
        const obj = error as Record<string, unknown>;
        const maybeMessage = obj['message'];
        const maybeError = obj['error'];
        const maybeDetails = obj['details'];

        if (typeof maybeMessage === 'string') {
          msg = maybeMessage;
        } else if (typeof maybeError === 'string') {
          msg = maybeError;
        } else if (typeof maybeDetails === 'string') {
          msg = maybeDetails;
        } else {
          try {
            msg = JSON.stringify(obj);
          } catch {
            msg = String(obj);
          }
        }
      } else {
        msg = String(error);
      }

      toast({
        title: "Submission Failed",
        description: msg || "There was an error submitting your booking.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: label ? `${label} copied` : "Copied",
        description: "Copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsProcessing(true);

    // Server-side availability check to avoid race conditions where the room
    // becomes unavailable after the user selected dates but before submitting.
    try {
      const { data: availOk, error: availErr } = await supabase.rpc('check_room_availability', {
        p_room_id: bookingData.room!.id,
        p_check_in: bookingData.checkIn!.toISOString().split('T')[0],
        p_check_out: bookingData.checkOut!.toISOString().split('T')[0],
      });

      if (availErr) throw availErr;

      // RPC returns truthy when available
      if (!availOk) {
        setIsProcessing(false);
        toast({
          title: "Room Unavailable",
          description: "The selected room is no longer available for the chosen dates. Please pick different dates or a different room.",
          variant: "destructive",
        });
        return;
      }
    } catch (err) {
      console.error('Availability check failed:', err);
      setIsProcessing(false);
      toast({
        title: "Availability Check Failed",
        description: err instanceof Error ? err.message : JSON.stringify(err),
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "paystack") {
      // Update Paystack config with the submitted email
      initializePayment({ onSuccess, onClose });
    } else {
      // Fallback to bank transfer when Stripe is unavailable/removed
      handleBankTransferSubmit(data);
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
                                  placeholder="Femi" 
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
                                  placeholder="Olumide" 
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
                                placeholder="femi@example.com" 
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
                        {(paymentSettings?.paystack_enabled || showFallbackPaymentOptions) && (
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
                        )}

                        {(paymentSettings?.stripe_enabled || showFallbackPaymentOptions) && (
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
                        )}

                        {(paymentSettings?.bank_enabled || showFallbackPaymentOptions) && (
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Label
                              htmlFor="bank"
                              className={`flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition-all p-4 ${
                                paymentMethod === "bank"
                                  ? "border-primary bg-primary/5"
                                  : "border-muted hover:border-muted-foreground/50"
                              }`}
                            >
                              <RadioGroupItem value="bank" id="bank" className="sr-only" />
                              <Wallet className="h-8 w-8 mb-2" />
                              <span className="font-semibold">Bank Transfer</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                Manual bank transfer
                              </span>
                            </Label>
                          </motion.div>
                        )}
                    </RadioGroup>
                  </motion.div>

                  {/* Payment Proof Upload for Bank Transfer */}
                  {paymentMethod === "bank" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Show bank account details here so users see where to transfer before uploading proof */}
                      {paymentSettings?.bank_enabled && (
                        <div className="mb-4 bg-background/50 p-4 rounded border">
                          <h4 className="font-semibold mb-2">Bank Transfer Details</h4>
                          <div className="space-y-1 text-sm">
                            {paymentSettings.bank_name && (
                              <div>
                                <span className="text-muted-foreground">Bank:</span>{" "}
                                <span className="font-medium">{paymentSettings.bank_name}</span>
                              </div>
                            )}
                            {paymentSettings.bank_account_name && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Account Name:</span>{" "}
                                <span className="font-medium">{paymentSettings.bank_account_name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(paymentSettings.bank_account_name || "", "Account name")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {paymentSettings.bank_account_number && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Account Number:</span>{" "}
                                <span className="font-medium">{paymentSettings.bank_account_number}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(paymentSettings.bank_account_number || "", "Account number")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {paymentSettings.bank_sort_code && (
                              <div>
                                <span className="text-muted-foreground">Sort Code / Routing:</span>{" "}
                                <span className="font-medium">{paymentSettings.bank_sort_code}</span>
                              </div>
                            )}
                            {paymentSettings.bank_swift_code && (
                              <div>
                                <span className="text-muted-foreground">SWIFT/BIC:</span>{" "}
                                <span className="font-medium">{paymentSettings.bank_swift_code}</span>
                              </div>
                            )}
                            {paymentSettings.bank_instructions && (
                              <div className="pt-2 text-xs text-muted-foreground">
                                {paymentSettings.bank_instructions}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-6">
                        <label className="text-sm font-medium block mb-2">
                          Upload Payment Proof <span className="text-destructive">*</span>
                        </label>
                        <p className="text-xs text-muted-foreground mb-4">
                          Please upload a screenshot or receipt of your bank transfer. Accepted formats: Image (JPG, PNG) or PDF. Max size: 5MB.
                        </p>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*,.pdf"
                          className="hidden"
                          id="payment-proof"
                        />
                        
                        {!paymentProofFile ? (
                          <motion.label
                            htmlFor="payment-proof"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              Click to upload payment proof
                            </span>
                          </motion.label>
                        ) : (
                          <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                            {paymentProofPreview ? (
                              <img
                                src={paymentProofPreview}
                                alt="Payment proof preview"
                                className="h-16 w-16 object-cover rounded"
                              />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center bg-muted rounded">
                                <FileImage className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {paymentProofFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(paymentProofFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={removePaymentProof}
                              className="shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
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
                      disabled={isProcessing || isUploading || (paymentMethod === "bank" && !paymentProofFile)}
                    >
                      {(isProcessing || isUploading) && (
                        <motion.div
                          className="absolute inset-0 bg-accent/20"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <span className="relative flex items-center justify-center gap-2">
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isProcessing || isUploading
                          ? "Processing..."
                          : paymentMethod === "bank"
                          ? paymentProofFile
                            ? "Submit Booking"
                            : "Upload Payment Proof First"
                          : "Proceed to Payment"}
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
                    {/* Promo code input and applied summary */}
                    <div className="mt-3">
                      <label className="text-sm font-medium">Promo Code</label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                        <Button onClick={async () => {
                          setIsApplyingPromo(true);
                          setPromoError(null);
                          try {
                            const code = (promoCode || "").trim();
                            if (!code) { setPromoError('Enter a promo code'); setIsApplyingPromo(false); return; }
                            const { data: p, error } = await supabase.from('promotions').select('*').eq('promo_code', code).single();
                            if (error || !p) { setPromoError('Invalid promo code'); setIsApplyingPromo(false); return; }
                            // Validate active and dates
                            const now = new Date();
                            if (!p.is_active) { setPromoError('This promo is not active'); setIsApplyingPromo(false); return; }
                            if (p.start_date && new Date(p.start_date) > now) { setPromoError('This promo is not yet active'); setIsApplyingPromo(false); return; }
                            if (p.end_date && new Date(p.end_date) < now) { setPromoError('This promo has expired'); setIsApplyingPromo(false); return; }
                            // usage limits
                            if (p.max_uses && (p.current_uses || 0) >= p.max_uses) { setPromoError('This promo has reached its usage limit'); setIsApplyingPromo(false); return; }
                            // min nights
                            if (p.min_nights && bookingData.nights < p.min_nights) { setPromoError(`Minimum ${p.min_nights} nights required`); setIsApplyingPromo(false); return; }
                            // applicable room types
                            if (p.applicable_room_types && p.applicable_room_types.length > 0 && bookingData.room && !p.applicable_room_types.includes(bookingData.room.room_type || bookingData.room.type || '')) { setPromoError('Promo not applicable to this room'); setIsApplyingPromo(false); return; }
                            // applicable locations
                            if (p.applicable_location_ids && p.applicable_location_ids.length > 0 && selectedLocation && !p.applicable_location_ids.includes(selectedLocation.id)) { setPromoError('Promo not applicable to this location'); setIsApplyingPromo(false); return; }
                            setAppliedPromo(p);
                            setPromoError(null);
                          } catch (e) {
                            console.error('Promo validation error', e);
                            setPromoError('Failed to validate promo');
                          } finally { setIsApplyingPromo(false); }
                        }}>Apply</Button>
                        {appliedPromo && <Button variant="ghost" onClick={() => { setAppliedPromo(null); setPromoCode(''); setPromoError(null); }}>Remove</Button>}
                      </div>
                      {promoError && <div className="text-sm text-destructive mt-2">{promoError}</div>}
                      {appliedPromo && (
                        <div className="mt-2 text-sm text-success">Applied: {appliedPromo.title} — Discount: {appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}%` : `₦${appliedPromo.discount_value}`}</div>
                      )}
                    </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>₦0</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{bookingData.totalPrice.toLocaleString()}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Promo: {appliedPromo.promo_code}</span>
                      <span>-₦{promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₦{adjustedTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* <div className="bg-muted/50 p-3 rounded-lg mt-4">
                  <p className="text-xs text-muted-foreground">
                    💳 Payment is processed securely via{" "}
                    {paymentMethod === "paystack" ? "Paystack" : paymentMethod === "stripe" ? "Stripe" : "Manual Bank Transfer"} (Test Mode)
                  </p>
                </div> */}

               
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
