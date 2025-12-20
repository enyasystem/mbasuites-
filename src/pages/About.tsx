import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Shield, Users } from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "General Manager",
      image: "/placeholder.svg",
    },
    {
      name: "Michael Chen",
      role: "Head of Operations",
      image: "/placeholder.svg",
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Experience Lead",
      image: "/placeholder.svg",
    },
    {
      name: "David Kim",
      role: "Property Manager",
      image: "/placeholder.svg",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Guest-Focused",
      description: "Every decision we make prioritizes your comfort and satisfaction",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "We maintain the highest standards of security and cleanliness",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We're committed to delivering exceptional service every time",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building lasting relationships with our guests and local partners",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About Our Hotel</h1>
            <p className="text-lg text-muted-foreground">
              We provide premium accommodations that combine modern design, comfortable living
              spaces, and attentive service so you can focus on what matters most during your stay.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded in 2015, our hotel has grown from a single property to a collection of
                premium locations serving thousands of satisfied guests. We believe that
                exceptional hospitality comes from attention to detail and genuine care for our
                guests' needs.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're traveling for business or leisure, we're dedicated to making your
                stay comfortable, convenient, and memorable. Our team works tirelessly to ensure
                every aspect of your experience exceeds expectations.
              </p>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                          <Icon className="h-6 w-6 text-accent" />
                        </div>
                        <h3 className="font-semibold mb-2">{value.title}</h3>
                        <p className="text-sm text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Meet Our Team</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <Card className="bg-accent/5">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
              <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-accent text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Modern Facilities</h3>
                    <p className="text-sm text-muted-foreground">
                      Fully furnished rooms with contemporary amenities
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-accent text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Prime Locations</h3>
                    <p className="text-sm text-muted-foreground">
                      Near business centers and tourist attractions
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-accent text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Flexible Booking</h3>
                    <p className="text-sm text-muted-foreground">
                      Transparent pricing with various payment options
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-accent text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">24/7 Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Responsive team always ready to assist
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
