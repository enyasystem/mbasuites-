import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground leading-relaxed">
            These are the general terms of service. This page contains placeholder text — replace
            with your full terms before publishing.
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
