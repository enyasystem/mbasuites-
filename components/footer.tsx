import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div>
            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
                <span className="font-serif text-2xl font-bold text-primary-foreground">MS</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-foreground block">MBA Suites</span>
                <span className="text-xs text-muted-foreground">Professional Services</span>
              </div>
            </div>
            <p className="text-pretty text-sm text-muted-foreground leading-relaxed">
              Premium business accommodations and professional services tailored for modern executives.
            </p>
          </div>

          <div>
            <h3 className="mb-5 font-semibold text-foreground text-lg">Explore</h3>
            <ul className="space-y-3 text-sm">
              {["Home", "Browse Rooms", "Special Offers", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-semibold text-foreground text-lg">Support</h3>
            <ul className="space-y-3 text-sm">
              {["Help Center", "Booking Guide", "Cancellations", "Privacy Policy", "Terms"].map((link) => (
                <li key={link}>
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-semibold text-foreground text-lg">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">123 Luxury Avenue, City Center</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">+234 800 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">info@hotelhub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-3">Follow us on social media for exclusive deals</p>
              <div className="flex justify-center md:justify-start gap-3">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Instagram, label: "Instagram" },
                  { icon: Twitter, label: "Twitter" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-xs text-muted-foreground">4.8★ Rating • 50K+ Happy Guests</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} MBA Suites. All rights reserved. |{" "}
            <Link href="/" className="hover:text-primary">
              Privacy
            </Link>{" "}
            |{" "}
            <Link href="/" className="hover:text-primary">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
