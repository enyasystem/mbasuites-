import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <Card className="p-6 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground mb-6">Reach out — were happy to help with bookings and questions.</p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Contact form">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input type="text" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea placeholder="How can we help?" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Send message</Button>
            </div>
          </form>

        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
