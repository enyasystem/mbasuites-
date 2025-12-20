import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import roomSuite from "@/assets/room-suite.jpg";
import { motion } from "framer-motion";

const LandingContact = () => {
  return (
    <section className="container mx-auto px-4 py-12" aria-labelledby="landing-contact-title">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 md:p-10 shadow-lg border-border/50 bg-gradient-to-br from-card to-secondary/20 hover:shadow-xl transition-shadow duration-300" role="region">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                Contact
              </motion.div>
              <h3 id="landing-contact-title" className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
                Ready to Book Your Stay?
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Questions about bookings or corporate stays? Our team is ready to help you find the perfect apartment.
              </p>
              <div className="space-y-4 mb-6">
                {[
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                    label: "Email",
                    value: "support@mbasuites.com",
                    href: "mailto:support@mbasuites.com"
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
                    label: "Phone",
                    value: "+234 773 657 0134",
                    href: "tel:+2347736570134"
                  }
                ].map((contact, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className="bg-accent/10 p-2 rounded-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {contact.icon}
                      </svg>
                    </motion.div>
                    <div>
                      <strong className="text-foreground block mb-1">{contact.label}</strong>
                      <a href={contact.href} className="text-muted-foreground hover:text-accent transition-colors">
                        {contact.value}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent">
                  <Link to="/contact">Send us a message</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-center justify-center md:justify-end"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <figure className="relative w-full max-w-md overflow-hidden rounded-xl shadow-xl group">
                <motion.img 
                  src={roomSuite} 
                  alt="Executive Suite living area at MBA Suites" 
                  loading="lazy" 
                  className="w-full h-[300px] object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <figcaption className="sr-only">Executive Suite image</figcaption>
              </figure>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
};

export default LandingContact;
