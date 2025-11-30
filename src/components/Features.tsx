import { Tag, Headphones, Globe2 } from "lucide-react";
import { RippleCard } from "@/components/ui/ripple-card";
import { motion } from "framer-motion";

const features = [
  {
    icon: Tag,
    title: "Special savings",
    description: "Compare packages, get great prices and find a deal that's right for you",
  },
  {
    icon: Headphones,
    title: "Reliable customer support",
    description: "Get in touch before or during your stay - we're always here when you need us",
  },
  {
    icon: Globe2,
    title: "A platform made for you",
    description: "23 languages covered, with 42 currencies and various payment methods accepted",
  },
];

const Features = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <RippleCard
              className="p-6 rounded-lg border border-border bg-gradient-to-b from-card to-secondary/30 hover:shadow-md transition-all duration-300 h-full"
            >
              <motion.div 
                className="flex flex-col items-start gap-4 text-left h-full"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="bg-accent/10 p-3 rounded-lg"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-6 w-6 text-accent" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </RippleCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
