import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Help & Support</h1>
            <p className="text-muted-foreground mb-6">We're here to help. Find answers to common questions below or reach out to our support team.</p>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-2">Bookings & Reservations</h2>
                <p className="text-sm text-muted-foreground mb-3">Need to modify or cancel a reservation? Learn about our cancellation policy, how to update dates, and more.</p>
                <Link to="/contact">
                  <Button variant="outline" size="sm">Contact Support</Button>
                </Link>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-2">Payments & Billing</h2>
                <p className="text-sm text-muted-foreground mb-3">Questions about invoices, accepted payment methods, or refunds? We'll guide you through our payment processes.</p>
                <Link to="/contact">
                  <Button variant="outline" size="sm">Contact Billing</Button>
                </Link>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-2">Amenities & Accessibility</h2>
                <p className="text-sm text-muted-foreground mb-3">Learn about apartment amenities, accessibility accommodations, and special requests.</p>
                <Link to="/rooms">
                  <Button size="sm">View Rooms</Button>
                </Link>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-2">Safety & Property Policies</h2>
                <p className="text-sm text-muted-foreground mb-3">Find our house rules, check-in/out procedures, and emergency contacts.</p>
                <Link to="/terms">
                  <Button variant="outline" size="sm">View Policies</Button>
                </Link>
              </Card>
            </div>
          </section>

          <aside className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground">Email: <a href="mailto:info@mbasuites.com" className="text-accent">info@mbasuites.com</a></p>
              <p className="text-sm text-muted-foreground">Phone: <a href="tel:+2348091234567" className="text-accent">+234 809 123 4567</a></p>
              <p className="text-sm text-muted-foreground">Address: 12B Kofo Abayomi Street, Victoria Island, Lagos, Nigeria</p>

              <div className="mt-4">
                <Link to="/contact">
                  <Button size="sm">Get in Touch</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Frequently Asked Questions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li><strong>Q:</strong> What is the check-in time? <br/><strong>A:</strong> Check-in is from 2:00 PM. Early check-in may be available on request.</li>
                <li><strong>Q:</strong> Do you allow pets? <br/><strong>A:</strong> Pets are allowed only at selected properties — contact support for details.</li>
                <li><strong>Q:</strong> Is parking available? <br/><strong>A:</strong> Limited on-site parking is available at most locations.</li>
              </ul>
            </Card>
          </aside>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
