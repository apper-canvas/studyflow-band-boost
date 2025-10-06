import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
          "border border-slate-100",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;