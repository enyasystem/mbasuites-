import heroImage from "@/assets/hero-hotel.jpg";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y }}
      >
        <motion.img
          src={heroImage}
          alt="Premium serviced apartments at MBA Suites"
          className="w-full h-[120%] object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/75 to-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-transparent" />
      </motion.div>

      {/* Animated Floating Elements */}
      <motion.div
        className="absolute bottom-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-accent/20 rounded-tl-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 bg-gold/10 rounded-full blur-2xl"
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content with Staggered Animations */}
      <motion.div 
        className="relative container mx-auto px-4 h-full flex flex-col justify-center"
        style={{ opacity }}
      >
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-full px-4 py-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="h-2 w-2 bg-accent rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-white">Premium Serviced Apartments in Lagos</span>
          </motion.div>
          
          {/* Title with Letter Animation */}
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Your Home Away<br />
            From <motion.span 
              className="text-accent inline-block"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(255, 107, 107, 0.5)",
                  "0 0 40px rgba(255, 107, 107, 0.8)",
                  "0 0 20px rgba(255, 107, 107, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Home
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl font-light leading-relaxed"
          >
            Experience premium comfort in fully furnished apartments designed for modern living. Perfect for business and leisure stays.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => window.location.href = '/rooms'}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent text-lg px-8 py-6 h-auto relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative">Explore Apartments</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => window.location.href = '/contact'}
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white text-lg px-8 py-6 h-auto backdrop-blur-sm"
              >
                Get in Touch
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
