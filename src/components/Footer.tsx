import { Hotel } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-accent p-2 rounded-lg">
                <Hotel className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">MBA Suites</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your premium serviced apartments in Lagos, Nigeria.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/rooms" className="text-primary-foreground/80 hover:text-accent transition-colors">Rooms &amp; Amenities</Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/help" className="text-primary-foreground/80 hover:text-accent transition-colors">Help</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-accent transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <strong>Email:</strong> <a href="mailto:info@mbasuites.com" className="hover:text-accent">info@mbasuites.com</a>
              </li>
              <li>
                <strong>Phone:</strong> <a href="tel:+2348091234567" className="hover:text-accent">+234 809 123 4567</a>
              </li>
              <li>
                <strong>Address:</strong> 12B Kofo Abayomi Street, Victoria Island, Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/70">
          <p>© 2025 MBA Suites. All rights reserved. Located in Lagos, Nigeria.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
