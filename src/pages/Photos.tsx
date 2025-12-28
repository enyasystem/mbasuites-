import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useRoom } from "@/hooks/useRoom";
import { galleryImages } from "@/data/galleryImages";

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

  if (room && room.image_url) images = [room.image_url];
  else if (state.images && Array.isArray(state.images)) images = state.images;
  else images = galleryImages.map((g) => g.src);

  const startIndex = typeof state.startIndex === "number" ? state.startIndex : 0;

  useEffect(() => {
    // scroll to the selected section on mount
    if (typeof startIndex === "number") {
      setTimeout(() => {
        const el = document.getElementById(`photo-section-${startIndex}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [startIndex]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Photo tour</h1>

        {/* Thumbnails */}
        <div className="flex gap-4 overflow-x-auto py-2 mb-8">
          {images.map((src, i) => (
            <button key={i} onClick={() => document.getElementById(`photo-section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`flex-none flex flex-col items-start gap-2 text-sm focus:outline-none ${i === startIndex ? 'ring-2 ring-accent rounded' : ''}`}>
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
                  <img src={src} alt={labelFor(i)} className="w-full h-[540px] md:h-[440px] lg:h-[480px] object-cover rounded" />
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Photos;
