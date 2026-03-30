import { useEffect, useRef } from 'react'

// Matrix Rain Characters
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Column settings
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = new Array(columns).fill(1)
    const speeds: number[] = new Array(columns).fill(1).map(() => Math.random() * 2 + 1)

    let animationId: number

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Green text with glow
      ctx.fillStyle = '#00FF41'
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`
      ctx.shadowColor = '#00FF41'
      ctx.shadowBlur = 10

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]

        // Calculate position
        const x = i * fontSize
        const y = drops[i] * fontSize

        // First character of each column is brighter
        if (drops[i] > 0) {
          // Gradient effect - brighter at the head
          const brightness = Math.min(drops[i] / 20, 1)
          ctx.fillStyle = `rgba(0, ${Math.floor(255 * brightness)}, ${Math.floor(65 * brightness)}, 1)`
        }

        ctx.fillText(char, x, y)

        // Reset drop to top with random delay when it goes off screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Move down
        drops[i] += speeds[i]
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.15]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

function ScanlineOverlay() {
  return (
    <div className="scanline-overlay" />
  )
}

function GridOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 65, 0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 65, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

function CornerDecorations() {
  return (
    <>
      {/* Top Left */}
      <div className="fixed top-0 left-0 w-24 h-24 pointer-events-none z-10">
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-[#00FF41]/30" />
        <div className="absolute top-6 left-6 w-12 h-12 border-l border-t border-[#00FF41]/20" />
      </div>
      {/* Top Right */}
      <div className="fixed top-0 right-0 w-24 h-24 pointer-events-none z-10">
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-[#00FF41]/30" />
        <div className="absolute top-6 right-6 w-12 h-12 border-r border-t border-[#00FF41]/20" />
      </div>
      {/* Bottom Left */}
      <div className="fixed bottom-0 left-0 w-24 h-24 pointer-events-none z-10">
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-[#00FF41]/30" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l border-b border-[#00FF41]/20" />
      </div>
      {/* Bottom Right */}
      <div className="fixed bottom-0 right-0 w-24 h-24 pointer-events-none z-10">
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-[#00FF41]/30" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-[#00FF41]/20" />
      </div>
    </>
  )
}

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#00FF41] rounded-full animate-matrix-rain"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.2,
            boxShadow: '0 0 6px #00FF41',
          }}
        />
      ))}
    </div>
  )
}

export function PageBackground() {
  return (
    <>
      {/* Base black background - using inline style to ensure it covers everything */}
      <div
        className="fixed inset-0 -z-50"
        style={{ backgroundColor: '#000000' }}
      />

      {/* Matrix Rain Effect */}
      <MatrixRain />

      {/* Grid Overlay */}
      <GridOverlay />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Corner Decorations */}
      <CornerDecorations />

      {/* Scanline Overlay */}
      <ScanlineOverlay />

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  )
}

// Matrix-styled theme exports
export const theme = {
  // Primary - Matrix Green
  primary: 'text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30',
  primarySolid: 'bg-[#00FF41] text-black',
  primaryText: 'text-[#00FF41]',
  primaryHover: 'hover:bg-[#00FF41]/20 hover:border-[#00FF41]/50',

  // Dark backgrounds
  darkBg: 'bg-black/90',
  darkCard: 'bg-[#0D0D0D]/95 backdrop-blur-xl border-[#00FF41]/20',

  // Borders
  border: 'border-[#00FF41]/20',
  borderHover: 'hover:border-[#00FF41]/50',

  // Text
  textPrimary: 'text-[#00FF41]',
  textSecondary: 'text-[#00FF41]/70',
  textMuted: 'text-[#00FF41]/50',

  // Buttons
  buttonPrimary: 'bg-transparent text-[#00FF41] border border-[#00FF41] hover:bg-[#00FF41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]',
  buttonGhost: 'bg-[#00FF41]/5 hover:bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20',

  // Chips
  chipDefault: 'bg-[#0D0D0D] text-[#00FF41]/80 border border-[#00FF41]/20 backdrop-blur-sm',
  chipPrimary: 'bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,65,0.2)]',

  // Inputs
  inputBg: 'bg-[#001100] border border-[#00FF41]/30 text-[#00FF41] placeholder:text-[#00FF41]/40',
  inputFocus: 'focus:border-[#00FF41] focus:ring-[#00FF41]/20 focus:shadow-[0_0_20px_rgba(0,255,65,0.3)]',

  // Glows
  glowSm: 'shadow-[#00FF41]/20',
  glowMd: 'shadow-[#00FF41]/30',
  glowLg: 'shadow-[#00FF41]/40',
}
