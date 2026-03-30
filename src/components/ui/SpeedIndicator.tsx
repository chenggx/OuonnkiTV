import { useVideoSpeed } from '@/hooks/useVideoSpeed'
import { Loader2, Zap, Gauge, Clock, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SpeedIndicatorProps {
  sourceCode: string
  vodId: string
  /** Display variant: badge(detail), badge-sm(card), expanded(detail top), compact */
  variant?: 'badge' | 'badge-sm' | 'expanded' | 'compact'
  /** Show loading animation */
  showLoading?: boolean
}

interface SpeedData {
  level: 'fast' | 'medium' | 'slow'
  speed: number
}

// Speed level colors - Matrix style
const levelColors = {
  fast: {
    bg: 'bg-[#00FF41]/20',
    border: 'border-[#00FF41]/40',
    text: 'text-[#00FF41]',
    glow: 'shadow-[#00FF41]/30',
  },
  medium: {
    bg: 'bg-[#00FFFF]/20',
    border: 'border-[#00FFFF]/40',
    text: 'text-[#00FFFF]',
    glow: 'shadow-[#00FFFF]/30',
  },
  slow: {
    bg: 'bg-[#FF0040]/20',
    border: 'border-[#FF0040]/40',
    text: 'text-[#FF0040]',
    glow: 'shadow-[#FF0040]/30',
  },
}

// Speed level labels
const levelLabels = {
  fast: 'FAST',
  medium: 'MED',
  slow: 'SLOW',
}

// Speed level hints
const levelHints = {
  fast: 'OPTIMAL',
  medium: 'ACCEPTABLE',
  slow: 'UNSTABLE',
}

// Speed icon component
const SpeedIcon = ({ level, size = 16 }: { level: string; size?: number }) => {
  if (level === 'fast') {
    return <Zap size={size} className="text-[#00FF41]" style={{ filter: 'drop-shadow(0 0 5px #00FF41)' }} />
  }
  if (level === 'medium') {
    return <Gauge size={size} className="text-[#00FFFF]" style={{ filter: 'drop-shadow(0 0 5px #00FFFF)' }} />
  }
  return <Clock size={size} className="text-[#FF0040]" style={{ filter: 'drop-shadow(0 0 5px #FF0040)' }} />
}

// Badge style - for detail page
const SpeedBadge = ({ speed }: { speed: SpeedData }) => {
  const colors = levelColors[speed.level]

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded
        border backdrop-blur-sm transition-all duration-300
        ${colors.bg} ${colors.border}
        hover:scale-105 active:scale-95
      `}
      style={{
        boxShadow: `0 0 15px ${speed.level === 'fast' ? 'rgba(0, 255, 65, 0.3)' : speed.level === 'medium' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 0, 64, 0.3)'}`,
      }}
    >
      <SpeedIcon level={speed.level} size={18} />
      <span className={`font-mono font-semibold text-sm ${colors.text}`}>
        {speed.speed}ms
      </span>
    </div>
  )
}

// Badge Small style - for search cards
const SpeedBadgeSm = ({ speed }: { speed: SpeedData }) => {
  const colors = levelColors[speed.level]

  return (
    <div
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded
        border backdrop-blur-sm transition-all duration-300
        ${colors.bg} ${colors.border}
      `}
      style={{
        boxShadow: `0 0 8px ${speed.level === 'fast' ? 'rgba(0, 255, 65, 0.2)' : speed.level === 'medium' ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 0, 64, 0.2)'}`,
      }}
    >
      <SpeedIcon level={speed.level} size={10} />
      <span className={`font-mono text-[10px] ${colors.text}`}>
        {speed.speed}ms
      </span>
    </div>
  )
}

// Expanded style - for detail page top
const SpeedExpanded = ({ speed }: { speed: SpeedData }) => {
  const colors = levelColors[speed.level]

  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-3 rounded
        border backdrop-blur-xl
        ${colors.bg} ${colors.border}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(0, 20, 0, 0.9) 0%, rgba(0, 10, 0, 0.95) 100%)',
        boxShadow: `0 0 20px ${speed.level === 'fast' ? 'rgba(0, 255, 65, 0.2)' : speed.level === 'medium' ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 0, 64, 0.2)'}`,
      }}
    >
      <div className={`p-2 rounded ${colors.bg}`} style={{ border: `1px solid ${colors.border}` }}>
        <SpeedIcon level={speed.level} size={24} />
      </div>

      <div className="flex flex-col">
        <span className="text-xs text-[#00FF41]/50 font-mono uppercase tracking-wider">Response</span>
        <span className={`text-xl font-bold font-mono ${colors.text}`}>{speed.speed}ms</span>
      </div>

      <div className="flex flex-col items-end ml-auto">
        <span className={`text-sm font-bold font-mono uppercase ${colors.text}`}>
          {levelLabels[speed.level]}
        </span>
        <span className="text-[10px] text-[#00FF41]/40 font-mono uppercase tracking-wider">
          {levelHints[speed.level]}
        </span>
      </div>
    </div>
  )
}

// Compact style
const SpeedCompact = ({ speed }: { speed: SpeedData }) => {
  const colors = levelColors[speed.level]

  return (
    <div className="flex items-center gap-2">
      <SpeedIcon level={speed.level} size={14} />
      <span className={`text-sm font-mono ${colors.text}`}>
        {speed.speed}ms
      </span>
    </div>
  )
}

// Loading state
const SpeedLoading = ({ variant = 'badge', showLoading = true }: { variant?: string; showLoading?: boolean }) => {
  if (!showLoading) return null

  if (variant === 'expanded') {
    return (
      <div
        className="flex items-center gap-4 px-4 py-3 rounded border border-[#003300] bg-[#001100]/80 backdrop-blur-xl"
        style={{ boxShadow: 'inset 0 0 15px rgba(0, 255, 65, 0.05)' }}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full border border-[#003300]" />
          <div
            className="absolute inset-0 rounded-full border border-transparent border-t-[#00FF41] animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-[#00FF41]/50 font-mono uppercase tracking-wider">Response</span>
          <span className="text-lg text-[#00FF41]/70 font-mono animate-pulse">TESTING...</span>
        </div>
      </div>
    )
  }

  if (variant === 'badge') {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-2 rounded border border-[#003300] bg-[#001100]/80 backdrop-blur-sm"
      >
        <div className="w-4 h-4 rounded-full border border-[#003300] relative">
          <div
            className="absolute inset-0 rounded-full border border-transparent border-t-[#00FF41] animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>
        <span className="text-xs text-[#00FF41]/60 font-mono animate-pulse">TEST...</span>
      </div>
    )
  }

  if (variant === 'badge-sm') {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#003300] bg-[#001100]/80 backdrop-blur-sm"
      >
        <div className="w-3 h-3 rounded-full border border-[#003300] relative">
          <div
            className="absolute inset-0 rounded-full border border-transparent border-t-[#00FF41] animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>
        <span className="text-[10px] text-[#00FF41]/50 font-mono animate-pulse">..</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Loader2 size={12} className="text-[#00FF41]/40 animate-spin" />
      <span className="text-xs text-[#00FF41]/40 font-mono">TEST</span>
    </div>
  )
}

// Error state
const SpeedError = ({ variant = 'badge' }: { variant?: string }) => {
  if (variant === 'expanded') {
    return (
      <div
        className="flex items-center gap-4 px-4 py-3 rounded border border-[#FF0040]/30 bg-[#200000]/80 backdrop-blur-xl"
        style={{ boxShadow: '0 0 15px rgba(255, 0, 64, 0.2)' }}
      >
        <div className="p-2 rounded border border-[#FF0040]/30 bg-[#FF0040]/10">
          <XCircle size={24} className="text-[#FF0040]" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-[#FF0040]/50 font-mono uppercase tracking-wider">Response</span>
          <span className="text-lg text-[#FF0040] font-mono">ERR</span>
        </div>
      </div>
    )
  }

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded border border-[#FF0040]/30 bg-[#200000]/80 backdrop-blur-sm">
        <XCircle size={14} className="text-[#FF0040]/60" />
        <span className="text-sm text-[#FF0040]/60 font-mono">--</span>
      </div>
    )
  }

  if (variant === 'badge-sm') {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#FF0040]/30 bg-[#200000]/80 backdrop-blur-sm">
        <XCircle size={10} className="text-[#FF0040]/60" />
        <span className="text-[10px] text-[#FF0040]/60 font-mono">--</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-[#FF0040]/40 font-mono">--</span>
    </div>
  )
}

export const SpeedIndicator = ({
  sourceCode,
  vodId,
  variant = 'badge',
  showLoading = true,
}: SpeedIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const { speed, loading, error } = useVideoSpeed(sourceCode, vodId, isVisible)

  if (error) {
    return (
      <div ref={ref}>
        <SpeedError variant={variant} />
      </div>
    )
  }

  if (loading || !speed) {
    return (
      <div ref={ref}>
        <SpeedLoading variant={variant} showLoading={showLoading} />
      </div>
    )
  }

  return (
    <div ref={ref}>
      {variant === 'expanded' && <SpeedExpanded speed={speed} />}
      {variant === 'badge' && <SpeedBadge speed={speed} />}
      {variant === 'badge-sm' && <SpeedBadgeSm speed={speed} />}
      {variant === 'compact' && <SpeedCompact speed={speed} />}
    </div>
  )
}
