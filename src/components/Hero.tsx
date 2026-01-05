import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-hotel.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SiteSettingRow = { setting_key: string; setting_value: string | null };

const fetchSiteSettings = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase.from("site_settings").select("setting_key, setting_value");
  if (error) throw error;
  const settings: Record<string, string> = {};
  (data || []).forEach((row: SiteSettingRow) => {
    if (row.setting_value) settings[row.setting_key] = row.setting_value;
  });
  return settings;
};

const HeroCarousel = () => {
  const { data: siteSettings } = useQuery<Record<string, string>>({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 5,
  });

  const heroImg = siteSettings?.hero_image || heroImage;
  const heroTitle = siteSettings?.hero_title || "MBA Suites";
  const heroSubtitle = siteSettings?.hero_subtitle || "FOR EVERYDAY COMFORT";
  return (
    <section className="relative h-[72vh] md:h-screen min-h-[520px] md:min-h-[700px] overflow-hidden pb-20">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={heroImg}
          alt="Luxury interior living space"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-6 md:px-12 flex flex-col justify-end pb-28 md:pb-40">
        <div className="max-w-3xl">
          {/* Headline */}
              <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="mb-1"
          >
            <span 
              className="block text-5xl md:text-6xl lg:text-7xl text-white/95 italic font-light"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {heroTitle}
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="text-white/70 text-sm md:text-base max-w-md leading-relaxed font-light"
          >
            {heroSubtitle}
          </motion.h2>

          {/* Description
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
            className="text-white/70 text-sm md:text-base max-w-md leading-relaxed font-light"
          >
            We provide refined, functional spaces that reflect your taste, lifestyle, and vision from booking to checkout.
          </motion.p> */}
        </div>

        {/* CTA Buttons - Bottom Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
            className="absolute bottom-8 md:bottom-28 right-6 md:right-12 flex gap-4"
        >
            {
              // motion-wrapped Button using Link as child (asChild)
            }
            <motion.div className="flex gap-4">
              <motion.div
                className="inline-block"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button asChild variant="default" size="lg">
                  <Link to="/rooms" className="flex items-center gap-2">
                    Book a room
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="inline-block"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button asChild variant="default" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to="/contact" className="flex items-center gap-2">
                    Contact Us
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroCarousel;
