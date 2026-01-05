import React, { useState, useEffect } from "react";
import { usePromotions } from "../hooks/usePromotions";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PromoBanner = () => {
  const { data: promotions = [], isLoading } = usePromotions({ activeOnly: true });
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!promotions || promotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promotions]);

  if (isLoading || !isVisible || !promotions || promotions.length === 0) return null;

  const currentPromo = promotions[currentIndex];

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % promotions.length);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-gradient-to-r from-accent via-accent/90 to-accent text-accent-foreground relative overflow-hidden"
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-3">
          {promotions.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPromo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-sm"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="font-semibold">{currentPromo.title}:</span>
              <span className="hidden sm:inline">{currentPromo.description}</span>
              {currentPromo.promo_code && (
                <code className="bg-accent-foreground/20 px-2 py-0.5 rounded font-mono text-xs">{currentPromo.promo_code}</code>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-semibold hover:bg-accent-foreground/10"
                onClick={() => navigate("/rooms")}
              >
                Book Now
              </Button>
            </motion.div>
          </AnimatePresence>

          {promotions.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {promotions.length > 1 && (
            <div className="flex gap-1 ml-2">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? "w-4 bg-accent-foreground" : "w-1.5 bg-accent-foreground/40"
                  }`}
                />
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 absolute right-2 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PromoBanner;
