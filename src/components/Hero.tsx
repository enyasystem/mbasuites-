import heroImage from "@/assets/hero-hotel.jpg";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PaymentSetting = {
  setting_key: string;
  setting_value: string | null;
};

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Multi-layer parallax with different speeds for depth
  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const yMidground = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yForeground = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [imageSrc, setImageSrc] = useState<string>(heroImage);
  const [titleText, setTitleText] = useState<string>("Your Home Away\nFrom Home");
  const [subtitleText, setSubtitleText] = useState<string>(
    "Experience premium comfort in fully furnished apartments designed for modern living. Perfect for business and leisure stays."
  );

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value");
        if (error) throw error;
        const settings: Record<string, string> = {};
        data?.forEach((s: PaymentSetting) => {
          if (s.setting_value) settings[s.setting_key] = s.setting_value;
        });
        if (!mounted) return;
        if (settings.hero_image) setImageSrc(settings.hero_image);
        if (settings.hero_title) setTitleText(settings.hero_title);
        if (settings.hero_subtitle) setSubtitleText(settings.hero_subtitle);
      } catch (err) {
        // keep defaults on error
        console.debug("Failed to load hero settings", err);
      }
    };
    loadSettings();
    return () => { mounted = false; };
  }, []);

  const titleLines = titleText.split("\n");

  return (
    <section ref={ref} className="hero relative min-h-[520px] md:min-h-[680px] lg:min-h-[760px] pt-0 sm:pt-0 md:pt-0 lg:pt-0 pb-12 md:pb-16 lg:pb-24 overflow-hidden" aria-labelledby="hero-heading">
      {/* Full-bleed background image */}
      <motion.img
        src={imageSrc || heroImage}
        alt="Stylish apartment living room"
        className="absolute inset-0 w-full h-full object-cover brightness-95"
        style={{ scale }}
        initial={{ scale: 1.02 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Subtle overlays for legibility and depth (stronger on small screens for contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b md:from-white/10 md:via-white/20 md:to-white/40 from-white/30 via-white/40 to-white/60 mix-blend-multiply" />
      <div className="absolute inset-0 bg-black/20 md:bg-black/10" />
      {/* pattern only on larger screens */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20 mix-blend-overlay hidden sm:block" />

      <div className="container mx-auto px-6 sm:px-4 relative z-10 flex flex-col items-center text-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5 max-w-4xl pt-2 sm:pt-4 md:pt-6"
          style={{ y: yForeground }}
        >
          <div className="bg-black/30 sm:bg-transparent backdrop-blur-sm rounded-xl p-4 sm:p-0">
            <div className="inline-flex items-center gap-3 bg-coral/10 backdrop-blur-sm border border-coral/20 rounded-full px-4 py-2 mx-auto">
              <span className="h-2 w-2 bg-coral rounded-full" />
              <span className="text-sm font-medium text-white sm:text-navy">Premium Serviced Apartments</span>
            </div>

            <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-cream/95 leading-tight md:leading-snug tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)]">
              {titleLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i !== titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
              Experience fully furnished, modern apartments tailored for business trips, short stays, and long-term comfort.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mt-4">
              <Button
                onClick={() => window.location.href = "/rooms"}
                className="bg-gradient-to-r from-accent to-coral text-accent-foreground shadow-accent px-6 sm:px-8 py-3 rounded-[35px] text-base sm:text-lg hover:shadow-xl w-full sm:w-auto"
              >
                View Available Apartments
              </Button>

              <Button
                onClick={() => window.location.href = "/contact"}
                variant="outline"
                className="px-6 py-3 rounded-[35px] text-base border-gray-200 bg-white/70 hover:bg-white/80 w-full sm:w-auto"
              >
                Talk to Us
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
