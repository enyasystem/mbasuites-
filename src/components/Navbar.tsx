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
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.nav 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-accent p-2 rounded-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Hotel className="h-6 w-6 text-accent-foreground" />
            </motion.div>
            <span className="text-xl font-bold text-primary">MBA Suites</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {["Home", "Rooms", "About", "Contact", "Help", "My Bookings"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Link 
                  to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`} 
                  className={`${item === "Home" ? "text-foreground font-medium" : "text-muted-foreground"} hover:text-accent transition-colors`}
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Section */}
          <motion.div 
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Register
              </Button>
            </motion.div>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden py-4 border-t border-border"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-4">
                <Link to="/" className="text-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/rooms" className="text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                  Rooms
                </Link>
                <Link to="/my-bookings" className="text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                  My Bookings
                </Link>
                <Link to="/help" className="text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
