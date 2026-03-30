import { useParams, useNavigate } from 'react-router'
import { apiService } from '@/services/api.service'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { type VideoItem } from '@/types'
import { useApiStore } from '@/store/apiStore'
import { useSearchStore } from '@/store/searchStore'
import {
  addToast,
  Pagination,
} from '@heroui/react'
import { NoResultIcon } from '@/components/icons'
import { PaginationConfig } from '@/config/video.config'
import { useDocumentTitle } from '@/hooks'
import { SpeedIndicator } from '@/components/ui/SpeedIndicator'
import { PageBackground } from '@/components/ui/PageBackground'
import { motion } from 'framer-motion'

// Proxy image URL
const proxyImageUrl = (url: string | undefined) => {
  if (!url) return url
  if (url.startsWith('/proxy') || url.startsWith('http://localhost') || url.startsWith('https://placehold')) {
    return url
  }
  return `/proxy?url=${encodeURIComponent(url)}`
}

// Matrix-style Video Card
function VideoCard({ item, index, onClick }: { item: VideoItem; index: number; onClick: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: 'easeOut',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container - Terminal Style */}
      <div
        className={`
          relative aspect-[2/3] rounded overflow-hidden
          transition-all duration-500 ease-out
          border border-[#00FF41]/20
          ${isHovered ? 'scale-[1.03] shadow-[0_0_30px_rgba(0,255,65,0.2)] border-[#00FF41]/50' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 20, 0, 0.95) 0%, rgba(0, 10, 0, 0.98) 100%)',
        }}
      >
        {/* Scanline effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div className="w-full h-[200%] animate-scanline opacity-10">
              <div className="w-full h-2 bg-gradient-to-b from-transparent via-[#00FF41] to-transparent" />
            </div>
          </div>
        )}

        {/* Image Layer */}
        <div className="absolute inset-0">
          {!isLoaded && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #001100 0%, #000000 100%)',
              }}
            />
          )}
          <img
            src={proxyImageUrl(item.vod_pic) || 'https://placehold.jp/30/001100/00FF41/300x450.png?text=NO+POSTER'}
            alt={item.vod_name}
            className={`h-full w-full object-cover transition-all duration-700 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />

          {/* Dark overlay gradient */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isHovered ? 'opacity-90' : 'opacity-70'
            }`}
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Top info bar */}
        <div className="absolute left-0 right-0 top-0 p-3 z-10">
          <div className="flex items-start justify-between gap-2">
            {/* Source tag - Terminal style */}
            <span
              className={`
                tag-badge-sm font-mono uppercase tracking-wider
                transition-all duration-300
                ${isHovered ? 'bg-[#00FF41] text-black border-[#00FF41]' : ''}
              `}
              style={{
                textShadow: isHovered ? 'none' : '0 0 10px rgba(0, 255, 65, 0.5)',
              }}
            >
              {item.source_name}
            </span>
            {/* Rating/Remarks */}
            {item.vod_remarks && (
              <span className="tag-badge-sm font-mono">
                {item.vod_remarks}
              </span>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-2">
          {/* Type and year */}
          <div className="flex items-center gap-2">
            <span className="tag-badge-sm font-mono uppercase">
              {item.type_name || 'MOVIE'}
            </span>
            <span className="tag-badge-sm font-mono">
              {item.vod_year}
            </span>
          </div>

          {/* Title - Glitch effect on hover */}
          <h3
            className={`
              font-bold leading-tight transition-all duration-300 font-mono
              text-[#00FF41] line-clamp-2 uppercase tracking-wider
              ${isHovered ? 'text-lg animate-glitch' : 'text-sm'}
            `}
            style={{
              textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
            }}
          >
            {item.vod_name}
          </h3>

          {/* Speed indicator */}
          <div className="pt-1">
            <SpeedIndicator
              sourceCode={item.source_code || ''}
              vodId={item.vod_id}
              variant="badge-sm"
            />
          </div>
        </div>

        {/* Play button overlay */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <motion.button
            className={`
              p-5 rounded-full
              bg-transparent border-2 border-[#00FF41]
              text-[#00FF41]
              transform transition-transform
              hover:scale-110 active:scale-95
            `}
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 20px rgba(0, 255, 65, 0.2)',
            }}
            onClick={e => {
              e.stopPropagation()
              onClick()
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.button>
        </div>

        {/* Corner decorations */}
        <div className={`absolute top-2 left-2 w-3 h-3 border-l border-t transition-all duration-300 ${isHovered ? 'border-[#00FF41]' : 'border-[#00FF41]/30'}`} />
        <div className={`absolute top-2 right-2 w-3 h-3 border-r border-t transition-all duration-300 ${isHovered ? 'border-[#00FF41]' : 'border-[#00FF41]/30'}`} />
        <div className={`absolute bottom-2 left-2 w-3 h-3 border-l border-b transition-all duration-300 ${isHovered ? 'border-[#00FF41]' : 'border-[#00FF41]/30'}`} />
        <div className={`absolute bottom-2 right-2 w-3 h-3 border-r border-b transition-all duration-300 ${isHovered ? 'border-[#00FF41]' : 'border-[#00FF41]/30'}`} />
      </div>
    </motion.div>
  )
}

// Terminal-style loading indicator
function TerminalLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-2 border-[#003300] animate-spin" />
        {/* Inner glow */}
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#00FF41] animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        {/* Center dot */}
        <div
          className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#00FF41]"
          style={{ boxShadow: '0 0 20px #00FF41' }}
        />
      </div>
      <div className="text-center">
        <p className="text-[#00FF41] font-mono text-sm tracking-wider animate-pulse">
          {'>'} SCANNING_DATABASES
        </p>
        <p className="text-[#00FF41]/50 font-mono text-xs mt-2">
          PLEASE_WAIT...
        </p>
      </div>
    </div>
  )
}

export default function SearchResult() {
  const abortCtrlRef = useRef<AbortController | null>(null)
  const { videoAPIs } = useApiStore()
  const { getCachedResults, updateCachedResults } = useSearchStore()
  const navigate = useNavigate()

  const { query } = useParams()
  const [searchRes, setSearchRes] = useState<VideoItem[]>([])
  const [curPage, setCurPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const timeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [invertPagination, setInvertPagination] = useState(false)
  const [searchStats, setSearchStats] = useState({ current: 0, total: 0, done: false })

  const selectedAPIs = useMemo(() => {
    return videoAPIs.filter(api => api.isEnabled)
  }, [videoAPIs])

  const paginationRes = useMemo(() => {
    const res = []
    for (let i = 0; i < searchRes.length; i += PaginationConfig.singlePageSize) {
      res.push(searchRes.slice(i, Math.min(i + PaginationConfig.singlePageSize, searchRes.length)))
    }
    return res || []
  }, [searchRes])

  const fetchSearchRes = useCallback(
    async (keyword: string | undefined) => {
      if (!keyword) return

      const searchAPIs = async (
        apisToSearch: typeof selectedAPIs,
        existingResults: VideoItem[],
        existingApiIds: string[],
      ) => {
        abortCtrlRef.current?.abort()
        const controller = new AbortController()
        abortCtrlRef.current = controller

        if (timeOutTimer.current) {
          clearTimeout(timeOutTimer.current)
          timeOutTimer.current = null
        }
        timeOutTimer.current = setTimeout(() => {
          setLoading(false)
          timeOutTimer.current = null
        }, PaginationConfig.maxRequestTimeout)

        const completedApiIds = [...existingApiIds]
        let hasNewResults = false
        setSearchStats({ current: existingResults.length, total: 0, done: false })

        const searchPromise = apiService
          .aggregatedSearch(
            keyword,
            apisToSearch,
            newResults => {
              hasNewResults = true
              setSearchRes(prevResults => {
                const mergedRes = [...prevResults, ...newResults]
                if (mergedRes.length >= PaginationConfig.singlePageSize) setLoading(false)
                return mergedRes
              })
              setSearchStats(prev => ({ ...prev, current: prev.current + newResults.length }))

              const newApiIds = Array.from(
                new Set(newResults.map(r => r.source_code).filter((id): id is string => !!id)),
              )
              newApiIds.forEach(id => {
                if (!completedApiIds.includes(id)) {
                  completedApiIds.push(id)
                }
              })

              updateCachedResults(keyword, newResults, completedApiIds, false)
            },
            controller.signal,
          )
          .then(allResults => {
            const allApiIds = apisToSearch.map(api => api.id)
            const finalApiIds = Array.from(new Set([...existingApiIds, ...allApiIds]))
            const selectedApiIds = selectedAPIs.map(api => api.id)
            const isComplete = selectedApiIds.every(id => finalApiIds.includes(id))

            updateCachedResults(keyword, hasNewResults ? [] : allResults, finalApiIds, isComplete)

            const totalCount = existingResults.length + allResults.length
            setSearchStats({ current: totalCount, total: totalCount, done: true })
            setLoading(false)

            addToast({
              title: `> SEARCH_COMPLETE: ${totalCount} RESULTS`,
              radius: 'lg',
              color: 'success',
              timeout: 2000,
              classNames: {
                base: 'bg-[#0D0D0D] border border-[#00FF41]/30 text-[#00FF41]',
                title: 'font-mono text-[#00FF41]',
              },
            })
          })
          .catch(error => {
            if ((error as Error).name === 'AbortError') {
              console.error('Search aborted:', error)
            } else {
              console.error('Search error:', error)
            }
          })

        addToast({
          title: '> SEARCHING_DATABASES...',
          promise: searchPromise,
          radius: 'lg',
          timeout: 1,
          hideCloseButton: true,
          classNames: {
            base: 'bg-[#0D0D0D] border border-[#00FF41]/20 text-[#00FF41]',
            title: 'font-mono text-[#00FF41]/70',
          },
        })
      }

      const cached = getCachedResults(keyword)
      const selectedApiIds = selectedAPIs.map(api => api.id)

      if (cached) {
        setSearchRes(cached.results)
        setSearchStats({ current: cached.results.length, total: cached.results.length, done: cached.isComplete })

        if (cached.isComplete) {
          setLoading(false)
          return
        }

        const remainingAPIs = selectedAPIs.filter(api => !cached.completedApiIds.includes(api.id))
        if (remainingAPIs.length === 0) {
          setLoading(false)
          updateCachedResults(keyword, [], selectedApiIds, true)
          return
        }

        setLoading(true)
        await searchAPIs(remainingAPIs, cached.results, cached.completedApiIds)
        return
      }

      setSearchRes([])
      setSearchStats({ current: 0, total: 0, done: false })
      await searchAPIs(selectedAPIs, [], [])
    },
    [selectedAPIs, getCachedResults, updateCachedResults],
  )

  useDocumentTitle(query ? `${query} | MATRIX SEARCH` : 'SEARCH RESULTS')

  useEffect(() => {
    setLoading(true)
    setCurPage(1)
    fetchSearchRes(query)
    return () => {
      abortCtrlRef.current?.abort()
    }
  }, [query, fetchSearchRes])

  useEffect(() => {
    let timer: number | null = null
    const run = () => {
      const total = document.documentElement.scrollHeight
      const view = window.innerHeight
      if (total <= view + 8) {
        setInvertPagination(true)
        return
      }
      const remaining = total - ((window.scrollY || window.pageYOffset) + view)
      setInvertPagination(remaining < 50)
    }
    const debounced = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(run, 80)
    }
    window.addEventListener('scroll', debounced, { passive: true })
    window.addEventListener('resize', debounced)
    run()
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener('scroll', debounced)
      window.removeEventListener('resize', debounced)
    }
  }, [paginationRes.length, curPage])

  // Matrix-style pagination theme
  const paginationTheme = invertPagination
    ? {
        base: 'bg-transparent transition-all',
        wrapper: 'px-[1vw] h-[5vh] rounded border border-[#00FF41]/20 bg-[#0D0D0D]/80 backdrop-blur-xl',
        item: 'shadow-sm rounded font-mono text-[#00FF41]/70 data-[active=true]:text-black md:hover:cursor-pointer md:[&[data-hover=true]:not([data-active=true])]:!bg-[#00FF41]/20 [&[data-pressed=true]]:!bg-[#00FF41]/30',
        prev: 'rounded font-mono text-[#00FF41]/50 data-[disabled=true]:text-[#00FF41]/20 md:hover:cursor-pointer md:[&[data-hover=true]:not([data-active=true])]:!bg-[#00FF41]/20 [&[data-pressed=true]]:!bg-[#00FF41]/30',
        next: 'rounded font-mono text-[#00FF41]/50 data-[disabled=true]:text-[#00FF41]/20 md:hover:cursor-pointer md:[&[data-hover=true]:not([data-active=true])]:!bg-[#00FF41]/20 [&[data-pressed=true]]:!bg-[#00FF41]/30',
        cursor: 'rounded bg-[#00FF41] text-black font-mono shadow-[0_0_15px_rgba(0,255,65,0.5)]',
      }
    : {
        base: 'bg-transparent transition-all',
        wrapper: 'px-[1vw] h-[5vh] rounded border border-[#00FF41]/20 bg-[#0D0D0D]/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,65,0.1)]',
        item: 'rounded font-mono text-[#00FF41]/70 data-[active=true]:text-black md:hover:cursor-pointer md:[&[data-hover=true]:not([data-active=true])]:!bg-[#00FF41]/20 [&[data-pressed=true]]:!bg-[#00FF41]/30',
        prev: 'rounded font-mono text-[#00FF41]/50 data-[disabled=true]:text-[#00FF41]/20 md:hover:cursor-pointer md:[&[data-hover=true]:not([data-active=true])]:!bg-[#00FF41]/20 [&[data-pressed=true]]:!bg-[#00FF41]/30',
        next: 'rounded font-mono text-[#00FF41]/50 data-[disabled=true]:text-[#00FF41]/20 md:hover:cursor-pointer md:[&[data-hover=true]:not([data-active=true])]:!bg-[#00FF41]/20 [&[data-pressed=true]]:!bg-[#00FF41]/30',
        cursor: 'rounded bg-[#00FF41] text-black font-mono shadow-[0_0_15px_rgba(0,255,65,0.5)]',
      }

  const onPageChange = (page: number) => {
    setCurPage(page)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="relative min-h-screen">
      <PageBackground />

      {/* Content area */}
      <div className="relative z-10 p-6">
        {/* Search results header */}
        {!loading && searchRes.length > 0 && (
          <motion.div
            className="mb-8 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              {/* Terminal prompt style */}
              <div className="flex items-center gap-2">
                <span className="text-[#00FF41]/50 font-mono">{'>'}</span>
                <h1
                  className="text-2xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
                  style={{
                    textShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
                  }}
                >
                  {query}
                </h1>
              </div>

              <div className="h-6 w-px bg-[#00FF41]/30" />

              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#00FF41]/50">{searchStats.done ? '' : '~'}</span>
                <span
                  className="text-2xl font-bold text-[#00FF41]"
                  style={{
                    textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
                  }}
                >
                  {searchStats.current}
                </span>
                <span className="text-sm text-[#00FF41]/50">RESULTS</span>
              </div>
            </div>

            {/* Status badge */}
            {searchStats.done && (
              <div
                className="rounded px-4 py-2 text-xs font-mono uppercase tracking-wider border border-[#00FF41]/30 bg-[#00FF41]/10 text-[#00FF41]"
                style={{
                  boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
                }}
              >
                {'>'} ALL_DATABASES_SCANNED
              </div>
            )}
          </motion.div>
        )}

        {/* Results grid */}
        {!loading && paginationRes[curPage - 1]?.length > 0 && (
          <div className="flex flex-col items-center gap-10">
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 md:grid-cols-4 lg:gap-6 xl:grid-cols-5 2xl:grid-cols-6">
              {paginationRes[curPage - 1]?.map((item: VideoItem, index: number) => (
                <VideoCard
                  key={`${item.source_code}_${item.vod_id}_${index}`}
                  item={item}
                  index={index}
                  onClick={() => navigate(`/detail/${item.source_code}/${item.vod_id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="sticky bottom-6 z-50 flex justify-center transition-all">
              <Pagination
                classNames={paginationTheme}
                onChange={onPageChange}
                showControls
                size={window.innerWidth < 640 ? 'sm' : 'lg'}
                initialPage={1}
                total={paginationRes.length}
              />
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && <TerminalLoader />}

        {/* No results */}
        {!loading && searchRes?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div
              className="mb-8 opacity-30"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(0, 255, 65, 0.3))',
              }}
            >
              <NoResultIcon size={180} />
            </div>
            <h2
              className="mb-4 text-3xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
              style={{
                textShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
              }}
            >
              NO_RESULTS_FOUND
            </h2>
            <p className="text-lg text-[#00FF41]/50 font-mono">TRY_DIFFERENT_KEYWORDS...</p>
          </div>
        )}
      </div>
    </div>
  )
}
