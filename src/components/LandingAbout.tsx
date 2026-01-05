import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import roomDeluxe from "/mba-suites_living-room_tv-wall_04.jpeg";
import { motion, useScroll, useTransform } from "framer-motion";

const LandingAbout = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="container mx-auto px-4 py-16" aria-labelledby="landing-about-title">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="mt-6 p-6 md:p-12 shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300" role="region">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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
                About Us
              </motion.div>
              <h2 id="landing-about-title" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Welcome to <span className="text-accent">MBA Suites</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-base sm:text-lg">
                Premium serviced apartments combining modern design with thoughtful amenities
                and attentive local service — ideal for both business and leisure stays in Lagos.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  "Fully furnished apartments with flexible stays",
                  "Central locations near business & leisure hubs",
                  "Transparent pricing and reliable local support"
                ].map((text, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <motion.div 
                      className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-accent"></div>
                    </motion.div>
                    <p className="text-muted-foreground">{text}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent">
                  <Link to="/about">Learn more about us</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="order-first md:order-last"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <figure className="relative overflow-hidden rounded-xl shadow-xl group">
                <motion.img
                  src={roomDeluxe}
                  alt="Deluxe King Room interior with city view at MBA Suites"
                  loading="lazy"
                  className="w-full h-56 sm:h-72 md:h-[400px] object-cover block"
                  style={{ y: imageY }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <figcaption className="sr-only">Deluxe King Room image</figcaption>
              </figure>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
};

export default LandingAbout;
