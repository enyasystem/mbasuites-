import { Hotel, Menu, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import type { Currency } from "@/context/CurrencyContext";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const currencies: { code: Currency; symbol: string; name: string }[] = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  const current = currencies.find(c => c.code === currency) ?? currencies[0];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-accent p-2 rounded-lg">
              <Hotel className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">MBA Suites</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-accent transition-colors font-medium">
              Home
            </Link>
            <Link to="/rooms" className="text-muted-foreground hover:text-accent transition-colors">
              Rooms
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors">
              Contact
            </Link>
            <Link to="/help" className="text-muted-foreground hover:text-accent transition-colors">
              Help
            </Link>
            <Link to="/my-bookings" className="text-muted-foreground hover:text-accent transition-colors">
              My Bookings
            </Link>
            <Link to="/help" className="text-muted-foreground hover:text-accent transition-colors">
              Help
            </Link>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                  {/* <DollarSign className="h-4 w-4" /> */}
                  <span>{current.symbol} {current.code}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currencies.map((curr) => (
                  <DropdownMenuItem
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className="cursor-pointer"
                  >
                    {curr.symbol} {curr.code} - {curr.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Register
            </Button>
            {/* <Button variant="outline" size="sm" asChild>
              <Link to="/staff-login">Staff Login</Link>
            </Button> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a href="/" className="text-foreground font-medium">
                Hotels
              </a>
              <a href="/rooms" className="text-muted-foreground">
                Rooms
              </a>
              <a href="/my-bookings" className="text-muted-foreground">
                My Bookings
              </a>
              <Link to="/help" className="text-muted-foreground">
                Help
              </Link>
              <div className="pt-4 border-t border-border">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-2 mb-3">
                      <DollarSign className="h-4 w-4" />
                      <span>{current.symbol} {current.code}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {currencies.map((curr) => (
                      <DropdownMenuItem
                        key={curr.code}
                        onClick={() => setCurrency(curr.code)}
                        className="cursor-pointer"
                      >
                        {curr.symbol} {curr.code} - {curr.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Sign In
                </Button>
                <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Register
                </Button>
              </div>
              {/* <Button variant="outline" size="sm" asChild>
                <Link to="/staff-login">Staff Login</Link>
              </Button> */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
