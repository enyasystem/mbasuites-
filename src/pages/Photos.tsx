import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useRoom } from "@/hooks/useRoom";
import { galleryImages } from "@/data/galleryImages";
import Lightbox from "@/components/Lightbox";

const defaultLabels = [
  "Living room",
  "Dining area",
  "Bedroom",
  "Full bathroom 1",
  "Shared full bathroom 2",
  "Exterior",
  "Pool",
  "Additional photos",
];

const labelFor = (i: number) => defaultLabels[i] || `Photo ${i + 1}`;

const Photos = () => {
  const { id } = useParams();
  const location = useLocation();
  const state = (location.state as { images?: string[]; startIndex?: number } | undefined) || {};

  // If this is a room-specific page, load the room to get its images
  const { room } = useRoom(id as string);

  let images: string[] = [];

  if (room && room.images && room.images.length > 0) images = room.images;
  else if (room && room.image_url) images = [room.image_url];
  else if (state.images && Array.isArray(state.images)) images = state.images;
  else images = galleryImages.map((g) => g.src);

  const startIndex = typeof state.startIndex === "number" ? Math.max(0, Math.min(state.startIndex!, images.length - 1)) : 0;

  // Current visible photo index
  const [currentIndex, setCurrentIndex] = useState<number>(Math.min(startIndex, Math.max(0, images.length - 1)));
  // Lightbox open state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Ensure current index is valid if images change — only update when out-of-range
  useEffect(() => {
    if (images.length === 0) return;
    if (currentIndex > images.length - 1) {
      // Schedule update to avoid synchronous setState inside effect
      setTimeout(() => setCurrentIndex(images.length - 1), 0);
    } else if (currentIndex < 0) {
      setTimeout(() => setCurrentIndex(0), 0);
    }
  }, [images.length, currentIndex]);

  // Scroll into view whenever currentIndex changes
  useEffect(() => {
    const id = `photo-section-${currentIndex}`;
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [currentIndex]);

  // Navigation helpers
  const goTo = useCallback((i: number) => {
    if (images.length === 0) return;
    const next = ((i % images.length) + images.length) % images.length; // wrap
    setCurrentIndex(next);
  }, [images.length]);

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // Keyboard navigation for page (disabled while lightbox open)
  useEffect(() => {
    if (lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(images.length - 1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, goTo, images.length, lightboxOpen]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Photo tour</h1>

          <div className="flex items-center gap-3">
            <button onClick={prev} aria-label="Previous photo" className="px-3 py-1 rounded bg-muted hover:bg-muted/90">Prev</button>
            <div className="text-sm text-muted-foreground">{images.length ? `${currentIndex + 1} / ${images.length}` : "0 / 0"}</div>
            <button onClick={next} aria-label="Next photo" className="px-3 py-1 rounded bg-muted hover:bg-muted/90">Next</button>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-4 overflow-x-auto py-2 mb-8">
          {images.map((src, i) => (
            <button key={i} onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }} className={`flex-none flex flex-col items-start gap-2 text-sm focus:outline-none ${i === currentIndex ? 'ring-2 ring-accent rounded' : ''}`}>
              <img src={src} alt={labelFor(i)} className="w-40 h-24 object-cover rounded shadow-sm" />
              <div className="pt-1 text-xs text-muted-foreground">{labelFor(i)}</div>
            </button>
          ))}
        </div>

        <hr className="my-6" />

        <div className="space-y-12">
          {images.map((src, i) => (
            <div id={`photo-section-${i}`} key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-3">
                <h3 className="text-xl font-semibold mb-4">{labelFor(i)}</h3>
              </div>
              <div className="lg:col-span-9">
                <Card className="overflow-hidden">
                  <button className="w-full block" onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}>
                    <img src={src} alt={labelFor(i)} className="w-full h-[540px] md:h-[440px] lg:h-[480px] object-cover rounded cursor-pointer" />
                  </button>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Lightbox
        images={images}
        open={lightboxOpen}
        index={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => { prev(); }}
        onNext={() => { next(); }}
      />

      <Footer />
    </div>
  );
};

export default Photos;
