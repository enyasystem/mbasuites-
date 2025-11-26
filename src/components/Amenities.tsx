import { Card } from "@/components/ui/card";
import { 
  Wifi, 
  AirVent, 
  ChefHat, 
  ShieldCheck, 
  Car, 
  Tv, 
  Sparkles,
  Waves,
  Dumbbell,
  Coffee
} from "lucide-react";
import { motion } from "framer-motion";

const amenities = [
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description: "Complimentary fiber-optic internet throughout",
  },
  {
    icon: AirVent,
    title: "Climate Control",
    description: "Individual AC units in every room",
  },
  {
    icon: ChefHat,
    title: "Fully Equipped Kitchen",
    description: "Modern appliances and cookware included",
  },
  {
    icon: ShieldCheck,
    title: "24/7 Security",
    description: "Secure access with surveillance system",
  },
  {
    icon: Car,
    title: "Free Parking",
    description: "Dedicated parking spaces for guests",
  },
  {
    icon: Tv,
    title: "Smart Entertainment",
    description: "Cable TV and streaming services",
  },
  {
    icon: Sparkles,
    title: "Housekeeping",
    description: "Regular cleaning services available",
  },
  {
    icon: Waves,
    title: "Swimming Pool",
    description: "Outdoor pool and leisure area",
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description: "Well-equipped gym facilities",
  },
  {
    icon: Coffee,
    title: "Workspace Ready",
    description: "Dedicated desk and high-speed connectivity",
  },
];

const Amenities = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-secondary/30 to-background" aria-labelledby="amenities-title">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-4"
            whileHover={{ scale: 1.05 }}
          >
            Premium Amenities
          </motion.div>
          <h2 id="amenities-title" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Everything You <span className="text-accent">Need</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our apartments come fully equipped with modern amenities to ensure your comfort and convenience throughout your stay.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {amenities.map((amenity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-6 border-border group cursor-pointer h-full">
                <motion.div 
                  className="flex flex-col items-center text-center gap-4 h-full"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-accent/10 to-coral/10 p-4 rounded-xl group-hover:from-accent/20 group-hover:to-coral/20 transition-colors"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <amenity.icon className="h-8 w-8 text-accent" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {amenity.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {amenity.description}
                    </p>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-muted-foreground">
            And many more amenities to make your stay comfortable and memorable
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Amenities;
