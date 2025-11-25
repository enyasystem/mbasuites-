import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">About MBA Suites</h1>
          <p className="text-muted-foreground leading-relaxed mb-4">
            MBA Suites provides premium serviced apartments in Lagos, Nigeria. We combine
            modern design, comfortable living spaces, and attentive service so you can focus
            on your stay — whether its business or leisure.
          </p>
          <section aria-labelledby="our-mission" className="mt-6">
            <h2 id="our-mission" className="text-xl font-semibold mb-2">Our mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To deliver consistent, comfortable, and convenient hospitality experiences
              through thoughtfully designed apartments and outstanding local service.
            </p>
          </section>

          <section aria-labelledby="why-choose" className="mt-6">
            <h2 id="why-choose" className="text-xl font-semibold mb-2">Why choose us</h2>
            <ul className="list-disc pl-5 text-muted-foreground">
              <li>Modern, fully furnished apartments</li>
              <li>Excellent locations near business and leisure hubs</li>
              <li>Flexible booking options and transparent pricing</li>
              <li>Responsive local support team</li>
            </ul>
          </section>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default About;
