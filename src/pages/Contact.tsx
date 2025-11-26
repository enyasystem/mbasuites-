import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/ui/animated-input";
import { AnimatedTextarea } from "@/components/ui/animated-textarea";
import { toast } from "@/hooks/use-toast";
import { Send, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Contact form data:", data);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });

    // Reset form and success state after delay
    setTimeout(() => {
      reset();
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 max-w-3xl mx-auto shadow-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
              <p className="text-muted-foreground mb-8">
                Reach out — we're happy to help with bookings and questions.
              </p>
            </motion.div>

            <form
              className="space-y-6"
              onSubmit={handleSubmit(onSubmit)}
              aria-label="Contact form"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AnimatedInput
                  label="Name"
                  type="text"
                  placeholder="Your full name"
                  error={errors.name?.message}
                  success={touchedFields.name && !errors.name}
                  {...register("name")}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AnimatedInput
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  success={touchedFields.email && !errors.email}
                  {...register("email")}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <AnimatedTextarea
                  label="Message"
                  placeholder="How can we help?"
                  error={errors.message?.message}
                  success={touchedFields.message && !errors.message}
                  maxLength={1000}
                  {...register("message")}
                />
              </motion.div>

              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[150px] relative overflow-hidden"
                    disabled={isSubmitting || isSuccess}
                  >
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{
                        opacity: isSuccess ? 0 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </motion.div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send message
                        </>
                      )}
                    </motion.div>
                    
                    {/* Success State */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isSuccess ? 1 : 0,
                        scale: isSuccess ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Sent!
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
