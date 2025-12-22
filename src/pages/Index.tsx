import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import LandingAbout from "@/components/LandingAbout";
import LandingContact from "@/components/LandingContact";
import SpecialOffers from "@/components/SpecialOffers";
import Amenities from "@/components/Amenities";
import Testimonials from "@/components/Testimonials";
import GalleryMap from "@/components/GalleryMap";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />
      <Hero />
      <SearchBar />
      <SpecialOffers />
      <Amenities />
      <LandingAbout />
      <Testimonials />
      <GalleryMap />
      <LandingContact />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
