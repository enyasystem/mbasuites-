import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Tag, Headphones, Globe2 } from "lucide-react";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/context/CurrencyContext";
import { motion } from "framer-motion";



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
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Featured Rooms
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredRooms.map((room, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border h-full"
              >
                <motion.div 
                  className="relative h-64 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                  <motion.div 
                    className="absolute top-4 left-4"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {room.badge}
                    </span>
                  </motion.div>
                  <motion.div 
                    className="absolute top-4 right-4"
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="bg-background/90 text-foreground text-sm font-bold px-3 py-2 rounded-lg">
                      {formatPrice(room.price)}/night
                    </span>
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-6 text-white"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold mb-1">{room.title}</h3>
                    <p className="text-sm mb-4 text-white/90">{room.subtitle}</p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={() => navigate("/rooms")}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent"
                      >
                        {room.cta}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Info / Offers Section (moved below featured rooms) */}
      <div className="mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Tag, title: "Special savings", desc: "Compare packages, get great prices and find a deal that's right for you" },
            { icon: Headphones, title: "Reliable customer support", desc: "Get in touch before or during your stay - we're always here when you need us" },
            { icon: Globe2, title: "A platform made for you", desc: "23 languages covered, with 42 currencies and various payment methods accepted" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full">
                <motion.div 
                  className="flex flex-col items-start gap-4 h-full"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="bg-accent/10 p-3 rounded-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="h-6 w-6 text-accent" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-r from-secondary to-cream border-accent/20 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div 
                    className="bg-accent/10 p-2 rounded-lg"
                    whileHover={{ rotate: [0, 360] }}
                    transition={{ duration: 0.6 }}
                  >
                    <Sparkles className="h-6 w-6 text-accent" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Early Bird Special</h4>
                    <p className="text-sm text-muted-foreground">Book 30 days in advance and save up to 25% on your stay</p>
                  </div>
                </div>
              </div>
              <motion.div 
                className="mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button onClick={() => navigate('/rooms')} className="bg-accent hover:bg-accent/90 text-accent-foreground">Learn More</Button>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default SpecialOffers;
