import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog";

type Props = {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
};

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

export default function PhotoTour({ images, open, onOpenChange, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex || 0);

  useEffect(() => {
    setIndex(initialIndex || 0);
    if (open) {
      // scroll to the selected section if opening with an index
      setTimeout(() => {
        const el = document.getElementById(`photo-section-${initialIndex || 0}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [initialIndex, open]);

  const labelFor = (i: number) => defaultLabels[i] || `Photo ${i + 1}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Photo tour</DialogTitle>
        </DialogHeader>

        {/* Thumbnails row */}
        <div className="mt-4 flex gap-4 overflow-x-auto py-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`flex-none flex flex-col items-start gap-2 text-sm focus:outline-none ${i === index ? "ring-2 ring-accent rounded" : ""}`}
            >
              <img src={src} alt={labelFor(i)} className="w-40 h-24 object-cover rounded shadow-sm" />
              <div className="pt-1 text-xs text-muted-foreground">{labelFor(i)}</div>
            </button>
          ))}
        </div>

        <hr className="my-6" />

        {/* Stacked sections: left heading + right image to mimic screenshots */}
        <div className="space-y-12">
          {images.map((src, i) => (
            <div id={`photo-section-${i}`} key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-3">
                <h3 className="text-xl font-semibold mb-4">{labelFor(i)}</h3>
              </div>
              <div className="lg:col-span-9">
                <img src={src} alt={labelFor(i)} className="w-full h-[440px] object-cover rounded shadow-md" />
              </div>
            </div>
          ))}
        </div>

        <DialogClose>
          <button className="mt-6 inline-block px-4 py-2 rounded bg-muted text-muted-foreground">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
