import React from "react";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import heroImage from "@/assets/hero-hotel.jpg";
import { motion } from "framer-motion";

const galleryImages = [
  { src: roomDeluxe, alt: "Deluxe King Room with modern furnishings" },
  { src: roomSuite, alt: "Executive Suite living area" },
  { src: heroImage, alt: "MBA Suites exterior and facilities" },
  { src: roomDeluxe, alt: "Bedroom with city view" },
  { src: roomSuite, alt: "Spacious apartment layout" },
];

const GalleryMap = () => {
  return (
    <section className="py-16 bg-background" aria-labelledby="gallery-title">
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
            Explore
          </motion.div>
          <h2 id="gallery-title" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Gallery & <span className="text-accent">Location</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our apartments and find us in the heart of Lagos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Gallery Carousel */}
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Our Apartments</h3>
            <Carousel className="w-full">
              <CarouselContent>
                {galleryImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden border-border">
                        <img
                          src={image.src}
                          alt={image.alt}
                          loading="lazy"
                          className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </motion.div>

          {/* Map */}
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Find Us in Lagos</h3>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-border">
                <div className="relative w-full h-[400px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.62283182786!2d3.1191762!3d6.5243793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1709567890123!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="MBA Suites Location in Lagos, Nigeria"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </Card>
            </motion.div>
            <motion.div 
              className="mt-4 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="font-semibold text-foreground mb-1">MBA Suites</p>
              <p>Located in prime areas across Lagos, Nigeria</p>
              <p className="mt-2">
                <a href="tel:+2347736570134" className="text-accent hover:underline">
                  +234 773 657 0134
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GalleryMap;
