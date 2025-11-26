import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface AnimatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

const AnimatedTextarea = React.forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({ className, label, error, success, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value.length > 0);
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    const isFloating = isFocused || hasValue || props.value;
    const maxLength = props.maxLength || 1000;

    return (
      <div className="relative">
        <motion.div
          className="relative"
          initial={false}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <textarea
            className={cn(
              "flex min-h-[120px] w-full rounded-lg border border-input bg-background px-4 pt-6 pb-3 text-sm transition-colors placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none",
              error && "border-destructive focus-visible:ring-destructive",
              success && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
          
          {label && (
            <motion.label
              className={cn(
                "absolute left-4 text-muted-foreground pointer-events-none origin-left transition-colors",
                error && "text-destructive",
                success && "text-green-600",
                isFocused && !error && !success && "text-accent"
              )}
              initial={false}
              animate={{
                top: isFloating ? "0.75rem" : "1.5rem",
                fontSize: isFloating ? "0.75rem" : "0.875rem",
                fontWeight: isFloating ? 600 : 400,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {label}
            </motion.label>
          )}

          {/* Success/Error Icons */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                className="absolute right-3 top-3"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                {error && <AlertCircle className="h-5 w-5 text-destructive" />}
                {success && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character Count */}
          <motion.div
            className="absolute right-3 bottom-3 text-xs text-muted-foreground"
            animate={{
              color: charCount > maxLength * 0.9 ? "rgb(239, 68, 68)" : "inherit",
            }}
          >
            {charCount}/{maxLength}
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-xs text-destructive mt-1.5 flex items-center gap-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                animate={{ x: [0, -3, 3, -3, 0] }}
                transition={{ duration: 0.4 }}
              >
                {error}
              </motion.span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Focus Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={false}
          animate={{
            boxShadow: isFocused
              ? error
                ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                : success
                ? "0 0 0 3px rgba(34, 197, 94, 0.1)"
                : "0 0 0 3px rgba(255, 107, 107, 0.1)"
              : "0 0 0 0px rgba(255, 107, 107, 0)",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    );
  }
);

AnimatedTextarea.displayName = "AnimatedTextarea";

export { AnimatedTextarea };
