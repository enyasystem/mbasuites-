import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import roomSuite from "@/assets/room-suite.jpg";

const LandingContact = () => {
  return (
    <section className="container mx-auto px-4 py-12" aria-labelledby="landing-contact-title">
      <Card className="p-8 md:p-10 motion-safe:animate-fade-in shadow-lg border-border/50 bg-gradient-to-br from-card to-secondary/20" role="region">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-4">
              Contact
            </div>
            <h3 id="landing-contact-title" className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
              Ready to Book Your Stay?
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Questions about bookings or corporate stays? Our team is ready to help you find the perfect apartment.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Email</strong>
                  <a href="mailto:shopimpulse@aol.com" className="text-muted-foreground hover:text-accent transition-colors">
                    shopimpulse@aol.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <strong className="text-foreground block mb-1">Phone</strong>
                  <a href="tel:+2347736570134" className="text-muted-foreground hover:text-accent transition-colors">
                    +234 773 657 0134
                  </a>
                </div>
              </div>
            </div>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent">
              <Link to="/contact">Send us a message</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center md:justify-end">
            <figure className="relative w-full max-w-md overflow-hidden rounded-xl shadow-xl group">
              <img 
                src={roomSuite} 
                alt="Executive Suite living area at MBA Suites" 
                loading="lazy" 
                className="w-full h-[300px] object-cover motion-safe:animate-scale-in group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent"></div>
              <figcaption className="sr-only">Executive Suite image</figcaption>
            </figure>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default LandingContact;
