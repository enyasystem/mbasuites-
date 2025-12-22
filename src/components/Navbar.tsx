import { Hotel, Menu, X, User, DollarSign, LogOut, LayoutDashboard, Shield, Users } from "lucide-react";
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
  const [heroVisible, setHeroVisible] = useState<boolean>(false);
  const { currency, setCurrency } = useCurrency();
  const { user, signOut } = useAuth();
  const { isAdmin, isStaff } = useRoleCheck();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-detect hero/background to set initial navbar theme (dark/light)
  // Start optimistic (true) so we don't render the spacer briefly before measurements run
  const [heroAtTop, setHeroAtTop] = useState<boolean>(true);
  useEffect(() => {
    const el = document.querySelector(".hero") as HTMLElement | null;
    if (!el) {
      setHeroVisible(false);
      setHeroAtTop(false);
      return;
    }

    const navEl = document.getElementById("mba-navbar");

    const updateHeroMetrics = () => {
      try {
        const r = el.getBoundingClientRect();
        const navH = navEl?.getBoundingClientRect().height ?? 0;
        setHeroVisible(r.bottom > 0 && r.top < window.innerHeight);
        // consider the hero at top when its top is at or above the navbar bottom (no visible gap)
        setHeroAtTop(r.top <= navH + 4);
      } catch (e) { /* ignore measurement errors */ }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setHeroVisible(entry.isIntersecting));
      },
      { root: null, threshold: 0.1 }
    );
    observer.observe(el);

    // set initial metrics
    updateHeroMetrics();

    // keep heroAtTop updated if the hero's layout changes
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(updateHeroMetrics);
      ro.observe(el);
    } catch (e) { /* ResizeObserver not available, skip */ }

    // also update on scroll so the metric accounts for the navbar height and scrolling
    const onScroll = () => updateHeroMetrics();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      try { ro?.disconnect(); } catch (e) { /* ignore */ }
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // visualScrolled controls the nav visual theme: opaque/dark text when true
  const visualScrolled = scrolled || !heroVisible;

  // Hide any other top-positioned <nav> elements that might be leftover duplicates
  useEffect(() => {
    const self = document.getElementById("mba-navbar");
    if (!self) return;
    const navs = Array.from(document.querySelectorAll("nav")) as HTMLElement[];
    navs.forEach((n) => {
      if (n === self) return;
      try {
        const r = n.getBoundingClientRect();
        // only hide navs that are positioned at the top of the viewport (likely duplicates)
        if (r.top >= -1 && r.top <= 1 && r.height > 0) {
          n.style.display = "none";
          n.setAttribute("data-mba-hidden", "1");
        }
      } catch (e) {
        // ignore cross-origin or measurement errors
      }
    });
  }, []);

  // More aggressive: continuously watch and hide any element near the top containing the main nav links; log details for debugging.
  useEffect(() => {
    const self = document.getElementById("mba-navbar");
    if (!self) return;

    // Repair any elements we accidentally hid previously (e.g., the main React root)
    const repairHiddenRoot = () => {
      const hidden = Array.from(document.querySelectorAll('[data-mba-hidden-aggressive="top-body-child"], [data-mba-hidden="1"]')) as HTMLElement[];
      hidden.forEach((el) => {
        if (!el) return;
        try {
          const r = el.getBoundingClientRect();
          if (el.id === 'root' || (el.id && el.id.toLowerCase().includes('root')) || r.height > 1000) {
            el.style.display = '';
            el.removeAttribute('data-mba-hidden-aggressive');
            el.removeAttribute('data-mba-hidden');
            console.log('[MBA Navbar] repaired mistakenly hidden element:', el);
          }
        } catch (e) { /* ignore cross-origin or measurement errors */ }
      });
    };
    repairHiddenRoot();

    const linkTexts = ["Home", "Rooms", "Help", "My Bookings", "Register", "Sign In", "Book Now"];

    const hideElement = (el: HTMLElement | null, reason: string) => {
      if (!el || el === self || self.contains(el)) return false;
      // never hide document or body or html
      if (el === document.body || el === document.documentElement) return false;
      // never hide the main app root by id or any element with 'root' in id
      if ((el.id && el.id.toLowerCase().includes('root'))) return false;
      try {
        const r = el.getBoundingClientRect();
        if (r.height === 0) return false;
        if (r.top < -10 || r.top > 80) return false; // only top elements
        // avoid hiding tiny elements that are unlikely to be navs and avoid hiding very large app roots
        if (r.height < 24 || r.width < 100 || r.height > 800) return false;
        el.style.display = "none";
        el.setAttribute("data-mba-hidden-aggressive", reason);
        console.log("[MBA Navbar] hid duplicate header:", el, reason, "rect:", r.top, r.height);
        return true;
      } catch (e) {
        return false;
      }
    };

    const scan = () => {
      try {
        const anchors = Array.from(document.querySelectorAll("a, button")) as HTMLElement[];
        const candidates = new Set<HTMLElement>();

        anchors.forEach((a) => {
          const txt = (a.textContent || "").trim();
          if (!txt) return;
          if (linkTexts.some(t => txt.toLowerCase().includes(t.toLowerCase()))) {
            const parent = a.closest("nav, header, [role='navigation'], div") as HTMLElement | null;
            if (parent) candidates.add(parent);
          }
        });

        candidates.forEach((c) => hideElement(c, "matched-links"));

        Array.from(document.body.children).forEach((child) => {
          const el = child as HTMLElement;
          if (!el) return;
          const tag = el.tagName?.toLowerCase();
          const role = el.getAttribute && el.getAttribute('role');
          const r = el.getBoundingClientRect();
          const containsLinks = linkTexts.some(t => (el.textContent || "").toLowerCase().includes(t.toLowerCase()));
          // Only consider nav/header-like elements or ones containing the main link texts, ensure they're a reasonable header size, and skip app root ids
          if ((tag === 'nav' || tag === 'header' || role === 'navigation' || containsLinks) && r.top >= -1 && r.top <= 80 && r.height > 24 && r.width > 100 && r.height < 800 && !(el.id && el.id.toLowerCase().includes('root'))) {
            hideElement(el, "top-body-child");
          }
        });
      } catch (e) {
        /* ignore DOM measurement or traversal errors */
      }
    };

    // Run scan repeatedly for a short period (covers late-rendered duplicates)
    scan();
    const interval = setInterval(scan, 250);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    // Also observe DOM changes and re-scan
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      mo.disconnect();
    };
  }, []);

  const current = currencies.find(c => c.code === currency) ?? currencies[0];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuVariants = {
    open: { opacity: 1, y: 0, transition: { when: 'beforeChildren', staggerChildren: 0.06, duration: 0.42 } },
    closed: { opacity: 0, y: -10, transition: { when: 'afterChildren', duration: 0.25 } },
  };

  const itemVariants = {
    open: { opacity: 1, y: 0, transition: { duration: 0.32 } },
    closed: { opacity: 0, y: -6, transition: { duration: 0.18 } },
  };

  return (
    <>
      <motion.nav 
        id="mba-navbar"
        data-mba-init="1"
        className={`fixed top-0 left-0 w-full z-50 px-4 ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
      <div className="mx-auto max-w-6xl px-4">
        <div className={`mx-auto mt-0 w-full max-w-3xl rounded-full flex items-center gap-6 justify-between px-6 py-2 transition-colors duration-300 pointer-events-auto ${visualScrolled ? 'bg-white/95 text-slate-900 shadow-lg border border-accent/40 backdrop-blur-sm' : 'bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm'}`}>
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
                  className={`${item === "Home" ? "font-medium" : ""} hover:text-accent transition-colors ${scrolled ? (item === 'Home' ? 'text-slate-900 font-medium' : 'text-slate-700') : (item === 'Home' ? 'text-foreground font-medium' : 'text-muted-foreground')}`}
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
                  <span className="bg-accent text-accent-foreground text-sm font-semibold px-3 py-1 rounded-full inline-flex items-center gap-3">
                    <span className="text-xs">{current.symbol}</span>
                    <span className="flex items-baseline gap-2">
                      <span className="font-semibold">{current.code}</span>
                      <span className="text-xs font-normal">{current.name}</span>
                    </span>
                  </span>
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
              ) : null }
            </div>

            {/* Right pill CTA (desktop) */}
            <div className="hidden md:flex items-center">
              {user ? null : (
                <Button size="sm" className="rounded-full bg-blue-300 text-black px-4 py-2" onClick={() => navigate('/rooms')}>
                  Book Now
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className={`md:hidden p-2 transition-colors duration-200 ease-in-out ${mobileMenuOpen ? 'bg-white/95 text-slate-900 rounded-full shadow border border-accent/20' : 'text-foreground hover:bg-white/10'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <AnimatePresence initial={false} mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="x" initial={{ rotate: -90, scale: 0.9, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.9, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, scale: 0.9, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: -90, scale: 0.9, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div key="overlay" className="fixed inset-0 z-40 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => setMobileMenuOpen(false)} />

              <motion.div key="mobile-menu" className="md:hidden fixed left-0 right-0 top-14 md:top-16 lg:top-20 py-4 border border-border bg-white/95 text-slate-900 shadow-xl rounded-xl mx-auto mt-0 overflow-hidden origin-top pointer-events-auto z-50 max-w-3xl px-4"
                initial="closed" animate="open" exit="closed" variants={menuVariants}
              >
                <motion.div className="flex flex-col gap-2 p-2" role="menu" aria-orientation="vertical">
                  <motion.div variants={itemVariants}><Link to="/" className="block px-4 py-3 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link></motion.div>
                  <motion.div variants={itemVariants}><Link to="/rooms" className="block px-4 py-3 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Rooms</Link></motion.div>
                  <motion.div variants={itemVariants}><Link to="/my-bookings" className="block px-4 py-3 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link></motion.div>
                  <motion.div variants={itemVariants}><Link to="/help" className="block px-4 py-3 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Help</Link></motion.div>

                  <div className="pt-4 border-t border-border">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full gap-2 mb-3">
                          <DollarSign className="h-4 w-4" />
                          <span className="bg-accent text-accent-foreground text-sm font-semibold px-3 py-1 rounded-full inline-flex items-center gap-3">
                            <span className="text-xs">{current.symbol}</span>
                            <span className="flex items-baseline gap-2">
                              <span className="font-semibold">{current.code}</span>
                              <span className="text-sm font-normal">{current.name}</span>
                            </span>
                          </span>
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
                    <motion.div variants={itemVariants} className="space-y-2">
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
                    </motion.div>
                  ) : (
                    <motion.div variants={itemVariants} className="flex gap-2">
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
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
    {/* spacer to prevent nav from covering page content on non-hero pages */}
    {!heroAtTop && <div aria-hidden="true" className="h-14 md:h-16 lg:h-20" />}
  </>
  );
};

export default Navbar;
