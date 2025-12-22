import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/ui/animated-input";
import { AnimatedTextarea } from "@/components/ui/animated-textarea";
import { toast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(500, "Message must be less than 500 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      reset();
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
          <CardDescription>We'd love to hear from you. Fill out the form below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedInput
              label="Name"
              placeholder="Your name"
              error={errors.name?.message}
              success={dirtyFields.name && !errors.name}
              {...register("name")}
            />

            <AnimatedInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={errors.email?.message}
              success={dirtyFields.email && !errors.email}
              {...register("email")}
            />

            <AnimatedInput
              label="Phone (Optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              error={errors.phone?.message}
              success={dirtyFields.phone && !errors.phone}
              {...register("phone")}
            />

            <AnimatedInput
              label="Subject"
              placeholder="How can we help?"
              error={errors.subject?.message}
              success={dirtyFields.subject && !errors.subject}
              {...register("subject")}
            />

            <AnimatedTextarea
              label="Message"
              placeholder="Tell us more about your inquiry..."
              rows={5}
              error={errors.message?.message}
              success={dirtyFields.message && !errors.message}
              {...register("message")}
            />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-accent mt-1" />
              <div>
                <h4 className="font-medium">Address</h4>
                <p className="text-sm text-muted-foreground">
                  Emcel Garden Estate<br />
                  Orchid, Lekki, Lagos<br />
                  Nigeria
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-accent mt-1" />
              <div>
                <h4 className="font-medium">Phone</h4>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-accent mt-1" />
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-muted-foreground">contact@mbasuites.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-accent mt-1" />
              <div>
                <h4 className="font-medium">Business Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9476519598093!2d-73.99185368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hotel Location"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
