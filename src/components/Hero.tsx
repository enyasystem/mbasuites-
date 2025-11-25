import heroImage from "@/assets/hero-hotel.jpg";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium serviced apartments at MBA Suites"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/75 to-navy/60" />
        {/* Decorative gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="h-2 w-2 bg-accent rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-white">Premium Serviced Apartments in Lagos</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in leading-tight">
            Your Home Away<br />From <span className="text-accent">Home</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl animate-slide-up font-light leading-relaxed">
            Experience premium comfort in fully furnished apartments designed for modern living. Perfect for business and leisure stays.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-scale-in">
            <Button 
              onClick={() => window.location.href = '/rooms'}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent text-lg px-8 py-6 h-auto"
            >
              Explore Apartments
            </Button>
            <Button 
              onClick={() => window.location.href = '/contact'}
              size="lg"
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white text-lg px-8 py-6 h-auto backdrop-blur-sm"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-accent/20 rounded-tl-full blur-3xl" />
      <div className="absolute top-20 right-20 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
    </section>
  );
};

export default Hero;
