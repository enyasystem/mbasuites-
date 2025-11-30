import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRipple } from "@/hooks/useRipple";

export interface RippleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const RippleCard = React.forwardRef<HTMLDivElement, RippleCardProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { ripples, addRipple } = useRipple();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        addRipple(e);
        onClick(e);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
        {onClick && (
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute rounded-full bg-accent/20 pointer-events-none"
                initial={{
                  width: ripple.size,
                  height: ripple.size,
                  x: ripple.x,
                  y: ripple.y,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  scale: 2,
                  opacity: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    );
  }
);
RippleCard.displayName = "RippleCard";

export { RippleCard };
