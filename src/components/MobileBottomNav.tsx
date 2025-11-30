import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, User, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Rooms", path: "/rooms" },
    { icon: Calendar, label: "Bookings", path: "/my-bookings" },
    { icon: User, label: "Profile", path: "/dashboard" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full relative",
                "transition-colors touch-manipulation",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-accent")} />
              <span className={cn("text-xs", isActive && "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
