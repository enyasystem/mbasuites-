import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How do I make a hotel booking on LuxeStay?",
    answer:
      "Simply enter your destination, check-in and check-out dates, and the number of guests in the search bar. Browse through available hotels, compare prices and amenities, then click 'Book Now' on your preferred option. Follow the checkout process to complete your reservation.",
  },
  {
    question: "Where can I find the cancellation policy?",
    answer:
      "Each hotel listing displays its specific cancellation policy. You can find detailed information on the hotel's page before booking, and it's also included in your confirmation email. Policies vary by property and rate type.",
  },
  {
    question: "How will I know if my hotel booking is confirmed?",
    answer:
      "You'll receive an instant confirmation email with your booking details and reservation number. You can also view your bookings in your account dashboard at any time.",
  },
  {
    question: "Will I be charged if I cancel my booking?",
    answer:
      "Cancellation fees depend on the hotel's policy and when you cancel. Many hotels offer free cancellation up to a certain date. Always review the cancellation terms before booking and in your confirmation email.",
  },
];

const FAQ = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          FAQs
        </motion.h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="lg" className="gap-2">
              <HelpCircle className="h-5 w-5" />
              Visit Help Center
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
