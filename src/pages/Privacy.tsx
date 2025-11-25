import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground leading-relaxed">
            We respect your privacy. This page explains what data we collect and how we use it.
            This is placeholder copy — replace with your full privacy policy before publishing.
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
