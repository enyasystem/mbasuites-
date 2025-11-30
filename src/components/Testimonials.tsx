import React from "react";
import { RippleCard } from "@/components/ui/ripple-card";
import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Fantastic stay — clean, comfortable and great location. The apartment exceeded expectations.",
    author: "Amina O.",
    role: "Business Traveler",
    rating: 5,
    initial: "A",
  },
  {
    quote: "Excellent service and very responsive staff. Will definitely book again for my next Lagos visit.",
    author: "John D.",
    role: "Corporate Guest",
    rating: 5,
    initial: "J",
  },
  {
    quote: "Perfect for business trips. Highly recommended. Great amenities and central location.",
    author: "Mary S.",
    role: "Frequent Visitor",
    rating: 5,
    initial: "M",
  },
  {
    quote: "The kitchen was fully equipped and the apartment felt like home. Great value for money.",
    author: "Ibrahim K.",
    role: "Extended Stay Guest",
    rating: 5,
    initial: "I",
  },
  {
    quote: "Wonderful experience from booking to checkout. The team was incredibly helpful and professional.",
    author: "Sarah L.",
    role: "Leisure Traveler",
    rating: 5,
    initial: "S",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-gradient-to-b from-background to-secondary/30 py-16" aria-labelledby="testimonials-title">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-4"
            whileHover={{ scale: 1.05 }}
          >
            Testimonials
          </motion.div>
          <h2 id="testimonials-title" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            What Guests <span className="text-accent">Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our guests say about their stays at MBA Suites.
          </p>
        </motion.div>
        
        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((t, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <RippleCard 
                    className="h-full p-8 border border-border rounded-lg hover:shadow-lg transition-all duration-300 relative overflow-hidden group" 
                    role="article" 
                    aria-label={`Testimonial by ${t.author}`}
                  >
                    {/* Decorative quote icon */}
                    <Quote className="absolute -top-2 -right-2 h-24 w-24 text-accent/5 group-hover:text-accent/10 transition-colors" />
                    
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    
                    {/* Quote */}
                    <blockquote className="text-foreground mb-6 leading-relaxed relative z-10 min-h-[100px]">
                      "{t.quote}"
                    </blockquote>
                    
                    {/* Author info */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-coral flex items-center justify-center text-white font-bold flex-shrink-0">
                        {t.initial}
                      </div>
                      <div>
                        <cite className="text-sm font-semibold text-foreground not-italic block">
                          {t.author}
                        </cite>
                        <span className="text-xs text-muted-foreground">{t.role}</span>
                      </div>
                    </div>
                  </RippleCard>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </div>

        {/* Mobile navigation hint */}
        <div className="text-center mt-6 md:hidden">
          <p className="text-sm text-muted-foreground">Swipe to see more testimonials</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
