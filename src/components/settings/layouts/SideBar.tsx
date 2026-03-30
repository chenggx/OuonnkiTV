import { type SettingModuleList } from '@/types'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

export default function SideBar({
  activeId,
  modules,
  onSelect,
  className,
}: {
  activeId: string
  modules: SettingModuleList
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn(`relative flex h-full w-full flex-col gap-2`, className)}>
      {modules.map(module => (
        <div
          key={module.id}
          className={`
            relative z-10 flex h-14 cursor-pointer items-center gap-3 rounded px-4
            transition-all duration-200 font-mono text-xs uppercase tracking-wider
            ${activeId === module.id
              ? 'text-[#00FF41]'
              : 'text-[#00FF41]/40 hover:text-[#00FF41]/70 hover:bg-[#00FF41]/5'
            }
            ${module.id === 'about_project' ? 'mt-auto' : ''}
          `}
          onClick={() => onSelect(module.id)}
        >
          {activeId === module.id && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 -z-10 rounded border border-[#00FF41]/30 bg-[#00FF41]/10 shadow-[0_0_20px_rgba(0,255,65,0.15)]"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          {/* Arrow indicator */}
          <span className="relative z-10 text-[#00FF41]/60">
            {activeId === module.id ? '>' : '-'}
          </span>
          <span className="relative z-10">{module.icon}</span>
          <h2
            className="relative z-10 font-semibold text-sm"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {module.name}
          </h2>
        </div>
      ))}
    </div>
  )
}
