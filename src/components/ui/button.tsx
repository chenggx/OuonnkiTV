import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/index"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-base font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 font-mono text-xs uppercase tracking-wider [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#00FF41]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-[#00FF41] text-black hover:bg-[#00FF41]/90 active:scale-[0.98] border border-[#00FF41]",
        destructive:
          "bg-[#FF0040]/20 text-[#FF0040] border border-[#FF0040]/30 hover:bg-[#FF0040]/30",
        outline:
          "border border-[#00FF41]/30 bg-transparent text-[#00FF41] hover:bg-[#00FF41]/10 hover:border-[#00FF41]/50 active:scale-[0.98]",
        secondary:
          "bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20 hover:bg-[#00FF41]/20 active:scale-[0.98]",
        ghost:
          "hover:bg-[#00FF41]/10 active:bg-[#00FF41]/15 text-[#00FF41]/70 hover:text-[#00FF41]",
        link: "text-[#00FF41] underline-offset-4 hover:underline",
        aurora: "bg-[#00FF41] text-black hover:bg-[#00FF41]/90 active:scale-[0.98] shadow-lg shadow-[#00FF41]/20 border border-[#00FF41]",
        // Matrix style variant
        matrix: "bg-transparent text-[#00FF41] border border-[#00FF41] hover:bg-[#00FF41]/10 shadow-[0_0_15px_rgba(0,255,65,0.2)]",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-3",
        sm: "h-9 px-4 text-xs has-[>svg]:px-3",
        md: "h-11 px-5 text-sm has-[>svg]:px-4",
        lg: "h-14 px-8 text-base has-[>svg]:px-5",
        icon: "size-12",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
