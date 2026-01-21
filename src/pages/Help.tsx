import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Bookings & Reservations",
      questions: [
        {
          q: "How do I make a reservation?",
          a: "You can make a reservation by browsing our available rooms, selecting your dates, and clicking 'Book Now'. Follow the checkout process to complete your booking.",
        },
        {
          q: "Can I modify or cancel my booking?",
          a: "Not yet for now, only admin can cancel your booking through the admin dashboard. Cancellation policies vary by rate - please check your booking confirmation for specific details.",
        },
        {
          q: "What is your cancellation policy?",
          a: "Standard cancellations made 48 hours before check-in receive a full refund. Cancellations within 48 hours are subject to a one-night charge.",
        },
      ],
    },
    {
      category: "Payments & Billing",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and select digital payment methods.",
        },
        {
          q: "When will I be charged?",
          a: "Your payment method will be charged immediately upon booking confirmation. For some rates, a deposit may be required with the balance due at check-in.",
        },
        {
          q: "Can I get a receipt or invoice?",
          a: "Yes, receipts are automatically sent to your email after payment. You can also download invoices from your dashboard.",
        },
      ],
    },
    {
      category: "Check-in & Check-out",
      questions: [
        {
          q: "What time is check-in and check-out?",
          a: "Standard check-in is from 3:00 PM and check-out is until 12:00 PM. Early check-in or late check-out may be available upon request for an additional fee.",
        },
        {
          q: "Do I need to show ID at check-in?",
          a: "Yes, a valid government-issued photo ID and the credit card used for booking are required at check-in.",
        },
        {
          q: "Can I check in early?",
          a: "Early check-in is subject to availability. Please contact us in advance to request early check-in.",
        },
      ],
    },
    {
      category: "Amenities & Services",
      questions: [
        {
          q: "Do you offer free Wi-Fi?",
          a: "Yes, complimentary high-speed Wi-Fi is available throughout the property for all guests.",
        },
        {
          q: "Is parking available?",
          a: "Yes, we offer both self-parking and valet parking options. Fees may apply - please check during booking.",
        },
        {
          q: "Do you allow pets?",
          a: "Select rooms are pet-friendly. Please contact us in advance to arrange pet accommodation. Additional fees may apply.",
        },
      ],
    },
  ];

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground mb-6">
              Search our knowledge base or browse by category
            </p>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 touch-manipulation"
                />
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No results found. Try a different search term.</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredFaqs.map((category) => (
                  <Card key={category.category} className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left touch-manipulation">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Need More Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link to="/contact">
                <Button className="w-full touch-manipulation">Contact Support</Button>
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/rooms" className="block text-sm text-accent hover:underline">
                  View Available Rooms
                </Link>
                <Link to="/my-bookings" className="block text-sm text-accent hover:underline">
                  Manage My Bookings
                </Link>
                <Link to="/terms" className="block text-sm text-accent hover:underline">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="block text-sm text-accent hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-accent/5">
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:mbasuites@yahoo.com" className="text-accent hover:underline">
                    mbasuites@yahoo.com
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+14708699787" className="text-accent hover:underline">
                    +1 470 869 9787 (WhatsApp)
                  </a>
                </p>
                <p className="text-muted-foreground">
                  Available 24/7 for urgent inquiries
                </p>
              </div>
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
