import { useEffect } from 'react'
import { Card, CardFooter, CardHeader, Chip, Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { useDoubanRecommend, type DoubanSubject } from '@/hooks/useDoubanRecommend'
import { useSearch } from '@/hooks'

interface DoubanRecommendProps {
  active: boolean
}

export default function DoubanRecommend({ active }: DoubanRecommendProps) {
  const { searchMovie } = useSearch()
  const {
    tags,
    currentTag,
    currentType,
    subjects,
    loading,
    error,
    switchType,
    switchTag,
    init,
  } = useDoubanRecommend()

  // Initialize when component is active
  useEffect(() => {
    if (active && subjects.length === 0) {
      init()
    }
  }, [active, init, subjects.length])

  // Handle card click - navigate to search results
  const handleCardClick = (subject: DoubanSubject) => {
    searchMovie(subject.title)
  }

  // Douban card component - Matrix style
  const DoubanCard = ({ subject, index }: { subject: DoubanSubject; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative w-full"
      style={{ aspectRatio: '2/3' }}
    >
      <Card
        isPressable
        isFooterBlurred
        onPress={() => handleCardClick(subject)}
        className="h-full w-full cursor-pointer border-none transition-all duration-300 hover:scale-[1.02]"
        radius="sm"
        isDisabled={loading}
        classNames={{
          base: 'bg-[#0D0D0D] border border-[#00FF41]/20 hover:border-[#00FF41]/50',
        }}
      >
        <CardHeader className="absolute top-1 z-10 flex-col items-start p-3">
          <div
            className="rounded px-2 py-1 backdrop-blur"
            style={{
              background: 'rgba(0, 20, 0, 0.8)',
              border: '1px solid rgba(0, 255, 65, 0.3)',
            }}
          >
            <p
              className="text-[10px] font-bold text-[#00FF41] uppercase tracking-wider"
              style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}
            >
              {subject.type === 'movie' ? 'MOVIE' : 'TV'}
            </p>
          </div>
          {subject.rate && (
            <Chip
              size="sm"
              classNames={{
                base: 'mt-2 border border-[#00FF41]/30',
                content: 'text-[#00FF41] font-mono text-xs',
              }}
              style={{
                background: 'rgba(0, 255, 65, 0.15)',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
              }}
            >
              {subject.rate}
            </Chip>
          )}
        </CardHeader>
        <img
          alt={subject.title}
          className="z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={subject.cover || 'https://placehold.jp/30/001100/00FF41/300x450.png?text=NO+POSTER'}
        />
        {/* Overlay gradient */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }}
        />
        <CardFooter
          className="absolute bottom-0 z-10 min-h-[8vh] w-full justify-between overflow-hidden border-t border-[#00FF41]/20 py-2"
          style={{
            background: 'rgba(0, 10, 0, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex flex-grow flex-col gap-1 px-1">
            <p
              className="line-clamp-2 text-sm font-semibold text-[#00FF41] uppercase tracking-wider"
              style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}
            >
              {subject.title}
            </p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )

  // Loading skeleton - Terminal style
  const LoadingSkeleton = () => (
    <div className="grid w-full grid-cols-2 gap-[4vw] sm:grid-cols-3 md:gap-[2vw] xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="relative w-full" style={{ aspectRatio: '2/3' }}>
          <Card
            isPressable
            isFooterBlurred
            className="h-full w-full items-center border border-[#003300] bg-[#0D0D0D]"
            radius="sm"
          >
            <div
              className="absolute inset-0 z-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #001100 0%, #000000 100%)' }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full border border-[#003300] animate-spin" />
                <div
                  className="absolute inset-0 rounded-full border border-transparent border-t-[#00FF41] animate-spin"
                  style={{ animationDuration: '1.5s' }}
                />
              </div>
            </div>
            <CardFooter
              className="absolute bottom-0 z-10 min-h-[8vh] w-full justify-between overflow-hidden border-t border-[#003300] py-2"
              style={{ background: 'rgba(0, 10, 0, 0.9)' }}
            >
              <div className="flex flex-grow flex-col gap-1 px-1">
                <div className="h-4 w-3/4 rounded bg-[#003300] animate-pulse" />
              </div>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  )

  if (!active) return null

  return (
    <div className="flex w-full flex-col items-center gap-6 px-4 py-8">
      {/* Type toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onPress={() => switchType('movie')}
          className={`
            cursor-pointer font-mono text-xs uppercase tracking-wider transition-all duration-300
            ${currentType === 'movie'
              ? 'bg-[#00FF41] text-black border border-[#00FF41]'
              : 'bg-transparent text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/10 hover:border-[#00FF41]/50'
            }
          `}
          style={{
            boxShadow: currentType === 'movie' ? '0 0 20px rgba(0, 255, 65, 0.3)' : 'none',
          }}
        >
          MOVIES
        </Button>
        <Button
          size="sm"
          onPress={() => switchType('tv')}
          className={`
            cursor-pointer font-mono text-xs uppercase tracking-wider transition-all duration-300
            ${currentType === 'tv'
              ? 'bg-[#00FF41] text-black border border-[#00FF41]'
              : 'bg-transparent text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/10 hover:border-[#00FF41]/50'
            }
          `}
          style={{
            boxShadow: currentType === 'tv' ? '0 0 20px rgba(0, 255, 65, 0.3)' : 'none',
          }}
        >
          TV_SERIES
        </Button>
      </div>

      {/* Tag toggle */}
      <div className="flex flex-wrap justify-center gap-2">
        {tags.slice(0, 10).map(tag => (
          <Button
            key={tag}
            size="sm"
            onPress={() => switchTag(tag)}
            className={`
              cursor-pointer font-mono text-xs transition-all duration-300
              ${currentTag === tag
                ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50'
                : 'bg-transparent text-[#00FF41]/60 border border-[#003300] hover:bg-[#00FF41]/5 hover:border-[#00FF41]/30'
              }
            `}
          >
            {tag.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#FF0040] font-mono text-sm">{'>'} ERROR: {error}</p>
          <Button
            size="sm"
            onPress={() => init()}
            className="bg-transparent text-[#00FF41] border border-[#00FF41]/30 font-mono text-xs uppercase tracking-wider hover:bg-[#00FF41]/10"
          >
            RETRY
          </Button>
        </div>
      )}

      {/* Content grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : subjects.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-[4vw] sm:grid-cols-3 md:gap-[2vw] xl:grid-cols-4">
          {subjects.map((subject, index) => (
            <DoubanCard key={`${subject.url}_${index}`} subject={subject} index={index} />
          ))}
        </div>
      ) : (
        <div
          className="flex items-center justify-center py-20 font-mono text-sm text-[#00FF41]/50 uppercase tracking-wider"
        >
          {'>'} NO_RECOMMENDATIONS_FOUND...
        </div>
      )}
    </div>
  )
}
