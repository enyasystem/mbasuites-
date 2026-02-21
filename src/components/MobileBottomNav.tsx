import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, User, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    // { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Rooms", path: "/rooms" },
    { icon: Calendar, label: "Bookings", path: "/my-bookings" },
    { icon: User, label: "Profile", path: "/dashboard" },
  ];

  return (
    <nav data-mba-init="1" className="fixed bottom-4 left-0 right-0 z-[9999] flex justify-center md:hidden pointer-events-auto">
      <div className="bg-background/95 backdrop-blur-sm shadow-lg rounded-full px-3 py-1 max-w-md w-[92%] sm:w-[88%] flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-1 rounded-full touch-manipulation transition-colors",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
            >
              <div className={cn("rounded-full flex items-center justify-center", isActive ? "bg-accent text-white p-1.5" : "p-1.5 text-muted-foreground")}> 
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn("text-xs mt-1", isActive ? "text-accent font-medium" : "text-muted-foreground")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
