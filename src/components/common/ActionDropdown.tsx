import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type ReactNode } from 'react'

export interface DropdownItem {
  label: string
  onClick?: () => void
  type?: 'item' | 'sub'
  children?: DropdownItem[]
  className?: string
}

interface ActionDropdownProps {
  label: string | ReactNode
  items: DropdownItem[]
  align?: 'start' | 'end' | 'center'
}

export default function ActionDropdown({ label, items, align = 'end' }: ActionDropdownProps) {
  const renderItem = (item: DropdownItem, index: number) => {
    if (item.type === 'sub' && item.children) {
      return (
        <DropdownMenuSub key={index}>
          <DropdownMenuSubTrigger
            className="cursor-pointer px-2 font-mono text-xs uppercase tracking-wider text-[#00FF41]/70 hover:text-[#00FF41] hover:bg-[#00FF41]/10"
            style={{ borderRadius: '4px' }}
          >
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              className="border border-[#00FF41]/20 bg-[#0D0D0D]/95 backdrop-blur-xl"
              style={{
                boxShadow: '0 0 30px rgba(0, 255, 65, 0.1)',
              }}
            >
              {item.children.map((child, childIndex) => renderItem(child, childIndex))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      )
    }

    return (
      <DropdownMenuItem
        key={index}
        className={`px-2 hover:cursor-pointer font-mono text-xs uppercase tracking-wider text-[#00FF41]/70 hover:text-[#00FF41] hover:bg-[#00FF41]/10 ${item.className || ''}`}
        onClick={item.onClick}
        style={{ borderRadius: '4px' }}
      >
        {item.label}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#001100]/50 backdrop-blur-xl border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/10 hover:border-[#00FF41]/50 font-mono text-xs uppercase tracking-wider"
        >
          {label} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-40 border border-[#00FF41]/20 bg-[#0D0D0D]/95 backdrop-blur-xl"
        align={align}
        style={{
          boxShadow: '0 0 30px rgba(0, 255, 65, 0.1), inset 0 0 20px rgba(0, 255, 65, 0.02)',
        }}
      >
        <DropdownMenuGroup>{items.map((item, index) => renderItem(item, index))}</DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
