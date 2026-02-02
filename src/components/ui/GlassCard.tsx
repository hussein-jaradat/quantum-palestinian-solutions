import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", padding = "md", interactive = false, children, ...props }, ref) => {
    const variants = {
      default: "glass-card",
      elevated: "glass-card-elevated",
      subtle: "bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          paddings[padding],
          interactive && "weather-card",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };