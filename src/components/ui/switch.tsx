import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/utils/index"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-[#00FF41] data-[state=unchecked]:bg-[#001100] focus-visible:border-[#00FF41] focus-visible:ring-[#00FF41]/50 dark:data-[state=unchecked]:bg-[#001100]/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-[#00FF41]/30 shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        boxShadow: 'inset 0 0 10px rgba(0, 255, 65, 0.1)',
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-[#00FF41] dark:data-[state=unchecked]:bg-[#003300] dark:data-[state=checked]:bg-black pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
        style={{
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
        }}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
