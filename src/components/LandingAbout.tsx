import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import roomDeluxe from "@/assets/room-deluxe.jpg";

const LandingAbout = () => {
  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="landing-about-title">
      <Card className="p-8 md:p-12 motion-safe:animate-slide-up shadow-lg border-border/50" role="region">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-4">
              About Us
            </div>
            <h2 id="landing-about-title" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Welcome to <span className="text-accent">MBA Suites</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
              Premium serviced apartments combining modern design with thoughtful amenities
              and attentive local service — ideal for both business and leisure stays in Lagos.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                </div>
                <p className="text-muted-foreground">Fully furnished apartments with flexible stays</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                </div>
                <p className="text-muted-foreground">Central locations near business &amp; leisure hubs</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                </div>
                <p className="text-muted-foreground">Transparent pricing and reliable local support</p>
              </div>
            </div>
            <div>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent">
                <Link to="/about">Learn more about us</Link>
              </Button>
            </div>
          </div>

          <div className="order-first md:order-last">
            <figure className="relative overflow-hidden rounded-xl shadow-xl group">
              <img
                src={roomDeluxe}
                alt="Deluxe King Room interior with city view at MBA Suites"
                loading="lazy"
                className="w-full h-[400px] object-cover block motion-safe:animate-scale-in group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent"></div>
              <figcaption className="sr-only">Deluxe King Room image</figcaption>
            </figure>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default LandingAbout;
