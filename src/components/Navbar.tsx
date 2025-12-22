import { Hotel, Menu, User, DollarSign, LogOut, LayoutDashboard, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { NotificationCenter } from "@/components/NotificationCenter";
import type { Currency } from "@/context/CurrencyContext";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const currencies: { code: Currency; symbol: string; name: string }[] = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { user, signOut } = useAuth();
  const { isAdmin, isStaff } = useRoleCheck();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = currencies.find(c => c.code === currency) ?? currencies[0];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav 
      className="sticky top-4 z-50 px-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className={`w-full rounded-full flex items-center gap-6 justify-between px-4 py-2 transition-colors duration-300 ${scrolled ? 'bg-black/95 text-white shadow-xl border border-black/20' : 'bg-transparent text-slate-800'}`}>
          {/* Left - Circular Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="Home">
              <div className="bg-white rounded-full p-2 shadow-sm">
                <img src="/logo.png" alt="MBA Suites" className="h-8 w-auto block" />
              </div>
            </Link>
          </div>

          {/* Center - Links (centered) */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            {['Home', 'Rooms', 'Help', 'My Bookings'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Link 
                  to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`} 
                  className={`${item === "Home" ? "font-medium" : ""} hover:text-accent transition-colors ${scrolled ? (item === 'Home' ? 'text-white' : 'text-white/80') : (item === 'Home' ? 'text-foreground font-medium' : 'text-muted-foreground')}`}
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right - actions + pill CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3" aria-hidden={true}>
              {user && <NotificationCenter />}
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

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span>{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    {isStaff && (
                      <DropdownMenuItem onClick={() => navigate("/staff")} className="cursor-pointer">
                        <Users className="h-4 w-4 mr-2" />
                        Staff Portal
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/login")}>
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="sm" 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => navigate("/signup")}
                    >
                      Register
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Right pill CTA (desktop) */}
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="bg-white text-black rounded-full px-4 py-2 font-medium shadow-sm">
                  {user.email ?? (user.user_metadata?.full_name || 'Account')}
                </div>
              ) : (
                <Button size="sm" className="rounded-full bg-white text-black px-4 py-2" onClick={() => navigate('/signup')}>
                  Register
                </Button>
              )}
            </div>
          </div>

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
                {user ? (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        navigate("/dashboard");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    {isStaff && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          navigate("/staff");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Staff Portal
                      </Button>
                    )}
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          navigate("/admin");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-destructive"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        navigate("/login");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => {
                        navigate("/signup");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
