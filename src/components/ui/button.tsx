import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "./buttonVariants";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRipple } from "@/hooks/useRipple";



export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const { ripples, addRipple } = useRipple();
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      addRipple(e);
      onClick?.(e);
    };

    if (asChild) {
      const Comp = Slot;
      return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} onClick={onClick} {...props} />;
    }

    return (
      <button 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        onClick={handleClick}
        {...props}
      >
        {props.children}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none"
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
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
