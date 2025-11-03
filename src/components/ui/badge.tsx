import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm",
        secondary:
          "border-transparent bg-secondary text-white hover:bg-secondary/80 shadow-sm shadow-secondary/20",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm",
        outline: "text-foreground border-secondary/30 hover:bg-secondary/5",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600 shadow-sm shadow-green-500/20",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm shadow-yellow-500/20",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
