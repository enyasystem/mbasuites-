import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGallery } from "@/hooks/useGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import heroImage from "@/assets/hero-hotel.jpg";

// Fallback images if database is empty
const fallbackImages = [
  { id: "1", image_url: roomDeluxe, title: "Deluxe King Room", room_type: "deluxe", location_name: "Lagos", room_id: "" },
  { id: "2", image_url: roomSuite, title: "Executive Suite", room_type: "suite", location_name: "Abuja", room_id: "" },
  { id: "3", image_url: heroImage, title: "Hotel Exterior", room_type: "standard", location_name: "Calabar", room_id: "" },
];

const GalleryMap = () => {
  const { items: dbItems, isLoading } = useGallery();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use database items or fallback
  const galleryImages = dbItems.length > 0 ? dbItems : fallbackImages;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

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
            Browse our apartments across Nigeria
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
            {isLoading ? (
              <Skeleton className="w-full h-[400px] rounded-lg" />
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {galleryImages.map((image, index) => (
                    <CarouselItem key={image.id}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => openLightbox(index)}
                        className="cursor-pointer"
                      >
                        <Card className="overflow-hidden border-border">
                          <img
                            src={image.image_url}
                            alt={image.title}
                            loading="lazy"
                            className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <h4 className="text-white font-semibold text-lg">{image.title}</h4>
                            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{image.location_name}</span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            )}
            <div className="mt-4 text-center">
              <Link to="/gallery">
                <Button variant="outline" size="sm">
                  View Full Gallery
                </Button>
              </Link>
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
            <h3 className="text-xl font-semibold mb-4 text-foreground">Find Us in Nigeria</h3>
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
                    title="Hotel360 Locations in Nigeria"
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
              <p className="font-semibold text-foreground mb-1">Hotel360</p>
              <p>Located in Enugu, Abuja, and Calabar, Nigeria</p>
              <p className="mt-2">
                <a href="tel:+2347736570134" className="text-accent hover:underline">
                  +234 773 657 0134
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {galleryImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {galleryImages[currentIndex] && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-center p-8"
              >
                <img
                  src={galleryImages[currentIndex].image_url}
                  alt={galleryImages[currentIndex].title}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-white text-xl font-semibold">
                    {galleryImages[currentIndex].title}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-white/70 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{galleryImages[currentIndex].location_name}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{galleryImages[currentIndex].room_type}</span>
                  </div>
                  {galleryImages[currentIndex].room_id && (
                    <Link
                      to={`/rooms/${galleryImages[currentIndex].room_id}`}
                      className="inline-block mt-4"
                      onClick={() => setLightboxOpen(false)}
                    >
                      <Button variant="secondary" size="sm">
                        View Room Details
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}

            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                {currentIndex + 1} / {galleryImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GalleryMap;
