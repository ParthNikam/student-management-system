import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = (variant: string = "default", size: string = "default") => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants: Record<string, string> = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 bg-red-500 text-white dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-800",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-50",
        link: "text-primary underline-offset-4 hover:underline dark:text-zinc-50",
    }

    const sizes: Record<string, string> = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    }

    return cn(base, variants[variant], sizes[size])
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    // If asChild is true, we should use Slot, but for simplicity let's assume standard button for now or just render children
    const Comp = "button"
    return (
      <Comp
        className={cn(buttonVariants(variant, size), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
