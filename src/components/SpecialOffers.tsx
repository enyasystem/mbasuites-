import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Tag, Headphones, Globe2 } from "lucide-react";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/context/CurrencyContext";



const featuredRooms = [
  {
    title: "Deluxe King Room",
    subtitle: "Spacious room with city view • Free WiFi • King bed",
    price: 189,
    image: roomDeluxe,
    badge: "Most Popular",
    cta: "Book now",
  },
  {
    title: "Executive Suite",
    subtitle: "Luxury suite with separate living area • Premium amenities",
    price: 349,
    image: roomSuite,
    badge: "Best Value",
    cta: "Book now",
  },
];

const SpecialOffers = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Featured Rooms Grid */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Featured Rooms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredRooms.map((room, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {room.badge}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-background/90 text-foreground text-sm font-bold px-3 py-2 rounded-lg">
                    {formatPrice(room.price)}/night
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{room.title}</h3>
                  <p className="text-sm mb-4 text-white/90">{room.subtitle}</p>
                  <Button 
                    onClick={() => navigate("/rooms")}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent"
                  >
                    {room.cta}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* Info / Offers Section (moved below featured rooms) */}
      <div className="mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex flex-col items-start gap-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <Tag className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-foreground mb-2">Special savings</h4>
                <p className="text-sm text-muted-foreground">Compare packages, get great prices and find a deal that's right for you</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-start gap-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <Headphones className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-foreground mb-2">Reliable customer support</h4>
                <p className="text-sm text-muted-foreground">Get in touch before or during your stay - we're always here when you need us</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-start gap-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <Globe2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-foreground mb-2">A platform made for you</h4>
                <p className="text-sm text-muted-foreground">23 languages covered, with 42 currencies and various payment methods accepted</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-secondary to-cream border-accent/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground">Early Bird Special</h4>
                  <p className="text-sm text-muted-foreground">Book 30 days in advance and save up to 25% on your stay</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => navigate('/rooms')} className="bg-accent hover:bg-accent/90 text-accent-foreground">Learn More</Button>
            </div>
          </Card>
        </div>
      </div>

    </section>
  );
};

export default SpecialOffers;
