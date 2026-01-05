import { Hotel } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" aria-label="Home">
                <img src="/mba_suites_logo.png" alt="MBA Suites" className="h-16 w-auto" />
              </Link>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your premium serviced apartments in Lagos (Nigeria), Nakuru (Kenya), Illinois (Georgia - USA).
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/about", label: "About Us" },
                { to: "/rooms", label: "Rooms & Amenities" },
                { to: "/contact", label: "Contact Us" },
                { to: "/help", label: "Help" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms of Service" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-foreground/80 hover:text-accent transition-colors inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <strong>Email:</strong> <a href="mailto:info@mbasuites.com" className="hover:text-accent transition-colors">info@mbasuites.com</a>
              </li>
              <li>
                <strong>Phone:</strong> <a href="tel:+2348091234567" className="hover:text-accent transition-colors">+234 809 123 4567</a>
              </li>
              <li>
                <strong>Address (Lagos - Branch):</strong> Emcel Garden Estate<br />
                Orchid, Lekki Phase 2 Lagos
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/70">
          <p>© 2025 MBA Suites. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
