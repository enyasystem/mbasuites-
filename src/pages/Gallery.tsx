import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGallery } from "@/hooks/useGallery";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Gallery = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const { items, locations, isLoading } = useGallery(selectedLocation);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-accent font-medium tracking-wider uppercase text-sm mb-4">
              Explore Our Spaces
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Photo Gallery
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse through our collection of beautifully designed rooms and suites across Nigeria
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant={!selectedLocation ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLocation(undefined)}
              className="rounded-full"
            >
              All Locations
            </Button>
            {locations.map((location) => (
              <Button
                key={location}
                variant={selectedLocation === location ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLocation(location)}
                className="rounded-full"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {location}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No images found</p>
              <Link to="/rooms">
                <Button variant="outline">Browse Rooms</Button>
              </Link>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.location_name}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{item.room_type}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
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

            {items.length > 1 && (
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

            {items[currentIndex] && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-center p-8"
              >
                <img
                  src={items[currentIndex].image_url}
                  alt={items[currentIndex].title}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-white text-xl font-semibold">
                    {items[currentIndex].title}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-white/70 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{items[currentIndex].location_name}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{items[currentIndex].room_type}</span>
                  </div>
                  <Link
                    to={`/rooms/${items[currentIndex].room_id}`}
                    className="inline-block mt-4"
                    onClick={() => setLightboxOpen(false)}
                  >
                    <Button variant="secondary" size="sm">
                      View Room Details
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {items.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                {currentIndex + 1} / {items.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Gallery;
