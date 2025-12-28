import React from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { galleryImages } from "@/data/galleryImages";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

const GalleryMap = () => {
  const navigate = useNavigate();

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
          {/* Gallery Mosaic */}
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Our Apartments</h3>

            {/* Mosaic grid: large left, stacked tiles on right */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4">
              {/* Large left image */}
              <div className="md:col-span-2 md:row-span-3">
                <Card className="overflow-hidden border-border rounded-lg h-full">
                  <button className="w-full h-full block" onClick={() => navigate('/photos', { state: { images: galleryImages.map(g => g.src), startIndex: 0 } })}>
                    <img src={galleryImages[0].src} alt={galleryImages[0].alt} loading="lazy" className="w-full h-full object-cover cursor-pointer" />
                  </button>
                </Card>
              </div>

              {/* Right column tiles */}
              <div className="hidden md:block">
                <Card className="overflow-hidden border-border rounded-lg h-28">
                  <button className="w-full h-full block" onClick={() => navigate('/photos', { state: { images: galleryImages.map(g => g.src), startIndex: 1 } })}>
                    <img src={galleryImages[1].src} alt={galleryImages[1].alt} loading="lazy" className="w-full h-full object-cover cursor-pointer" />
                  </button>
                </Card>
              </div> 

              <div className="hidden md:block">
                <Card className="overflow-hidden border-border rounded-lg h-28">
                  <button className="w-full h-full block" onClick={() => navigate('/photos', { state: { images: galleryImages.map(g => g.src), startIndex: 2 } })}>
                    <img src={galleryImages[2].src} alt={galleryImages[2].alt} loading="lazy" className="w-full h-full object-cover cursor-pointer" />
                  </button>
                </Card>
              </div>

              <div className="hidden md:block">
                <Card className="overflow-hidden border-border rounded-lg h-28">
                  <button className="w-full h-full block" onClick={() => navigate('/photos', { state: { images: galleryImages.map(g => g.src), startIndex: 3 } })}>
                    <img src={galleryImages[3].src} alt={galleryImages[3].alt} loading="lazy" className="w-full h-full object-cover cursor-pointer" />
                  </button>
                </Card>
              </div>

              <div className="relative hidden md:block">
                <Card className="overflow-hidden border-border rounded-lg h-28">
                  <button className="w-full h-full block" onClick={() => navigate('/photos', { state: { images: galleryImages.map(g => g.src), startIndex: 4 } })}>
                    <img src={galleryImages[4].src} alt={galleryImages[4].alt} loading="lazy" className="w-full h-full object-cover cursor-pointer" />
                  </button>
                </Card>
                <button onClick={() => navigate('/photos', { state: { images: galleryImages.map(g => g.src), startIndex: 0 } })} className="absolute bottom-3 right-3 bg-white/90 text-foreground py-2 px-3 rounded-full shadow-md hover:bg-white">
                  <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 000 2h12a1 1 0 100-2H4zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 5a1 1 0 000 2h12a1 1 0 100-2H4z" /></svg>
                    Show all photos
                  </span>
                </button>
              </div>

              {/* Mobile fallback: show small thumbnails stacked below */}
              <div className="md:hidden grid grid-cols-2 gap-3 mt-4">
                {galleryImages.slice(1).map((image, i) => (
                  <Card key={i} className="overflow-hidden border-border rounded-lg h-24">
                    <button className="w-full h-full block" onClick={() => navigate('/photos', { state: { images: galleryImages.map(g => g.src), startIndex: i + 1 } })}>
                      <img src={image.src} alt={image.alt} loading="lazy" className="w-full h-full object-cover cursor-pointer" />
                    </button>
                  </Card>
                ))}
              </div>
            </div>

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
              <p>Located in prime areas across Lagos (Nigeria), Nakuru (Kenya), Illinois (Georgia - USA)</p>
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
