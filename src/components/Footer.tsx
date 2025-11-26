import { Hotel } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="bg-accent p-2 rounded-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Hotel className="h-6 w-6 text-accent-foreground" />
              </motion.div>
              <span className="text-xl font-bold">MBA Suites</span>
            </motion.div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your premium serviced apartments in Lagos, Nigeria.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/about", label: "About Us" },
                { to: "/rooms", label: "Rooms & Amenities" },
                { to: "/contact", label: "Contact Us" },
                { to: "/help", label: "Help" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms of Service" }
              ].map((link, index) => (
                <motion.li 
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <Link to={link.to} className="text-primary-foreground/80 hover:text-accent transition-colors inline-block">
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <strong>Email:</strong> <a href="mailto:info@mbasuites.com" className="hover:text-accent transition-colors">info@mbasuites.com</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <strong>Phone:</strong> <a href="tel:+2348091234567" className="hover:text-accent transition-colors">+234 809 123 4567</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <strong>Address:</strong> 12B Kofo Abayomi Street, Victoria Island, Lagos, Nigeria
              </motion.li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p>© 2025 MBA Suites. All rights reserved. Located in Lagos, Nigeria.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
