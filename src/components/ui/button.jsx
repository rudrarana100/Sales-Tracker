import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-subtle",
        outline: "border border-ash bg-background text-charcoal hover:bg-paper-mist",
        secondary: "bg-paper-mist text-charcoal hover:bg-ash",
        ghost: "text-charcoal hover:bg-paper-mist",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-electric-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-3 rounded-md",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-7 gap-1 rounded-md px-2.5 text-xs",
        lg: "h-9 gap-1.5 px-4 rounded-md",
        icon: "size-8 rounded-md",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9 rounded-md",
        pill: "h-8 gap-1.5 px-4 rounded-full",
        "pill-sm": "h-7 gap-1 px-3 rounded-full text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
