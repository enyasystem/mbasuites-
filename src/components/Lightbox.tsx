import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  open: boolean;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Lightbox({ images, open, index, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    if (open) {
      // lock background scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!images || images.length === 0) return null;

  const src = images[index] ?? images[0];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] p-0 bg-transparent">
        <div className="relative w-full h-[85vh] flex items-center justify-center bg-black/80 rounded">
          <button onClick={onPrev} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/40 text-white p-3 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>

          <img src={src} alt={`Photo ${index + 1}`} className="max-h-[80vh] max-w-full object-contain" />

          <button onClick={onNext} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/40 text-white p-3 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </button>

          <DialogClose asChild>
            <button aria-label="Close" className="absolute top-4 right-4 bg-black/50 hover:bg-black/40 text-white p-2 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </DialogClose>

          {/* caption + counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/90 bg-black/30 px-3 py-1 rounded">
            {index + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
