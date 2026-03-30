import { useParams, useNavigate } from 'react-router'
import { useState, useEffect, useMemo } from 'react'
import { apiService } from '@/services/api.service'
import { type DetailResponse } from '@/types'
import { useApiStore } from '@/store/apiStore'
import { useSettingStore } from '@/store/settingStore'
import { Button, Tooltip, Divider, Select, SelectItem } from '@heroui/react'
import { useDocumentTitle } from '@/hooks'
import { ArrowUpIcon, ArrowDownIcon, ChevronDownIcon } from '@/components/icons'
import { motion } from 'framer-motion'
import { PageBackground } from '@/components/ui/PageBackground'
import { SpeedIndicator } from '@/components/ui/SpeedIndicator'

export default function Detail() {
  const { sourceCode, vodId } = useParams<{ sourceCode: string; vodId: string }>()
  const navigate = useNavigate()
  const { videoAPIs } = useApiStore()
  const { playback } = useSettingStore()

  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReversed, setIsReversed] = useState(playback.defaultEpisodeOrder === 'desc')
  const [currentPageRange, setCurrentPageRange] = useState<string>('')
  const [episodesPerPage, setEpisodesPerPage] = useState(100)

  useEffect(() => {
    const calculateEpisodesPerPage = () => {
      const width = window.innerWidth
      let cols = 2
      let rows = 8

      if (width >= 1024) {
        cols = 8
        rows = 5
      } else if (width >= 768) {
        cols = 6
        rows = 6
      } else if (width >= 640) {
        cols = 3
        rows = 8
      }

      setEpisodesPerPage(cols * rows)
    }

    calculateEpisodesPerPage()
    window.addEventListener('resize', calculateEpisodesPerPage)
    return () => window.removeEventListener('resize', calculateEpisodesPerPage)
  }, [])

  useDocumentTitle(detail?.videoInfo?.title || 'LOADING... | MATRIX')

  const getTitle = () => detail?.videoInfo?.title || ''
  const getCover = () =>
    detail?.videoInfo?.cover || 'https://placehold.jp/30/001100/00FF41/300x450.png?text=NO+POSTER'
  const getType = () => detail?.videoInfo?.type || ''
  const getYear = () => detail?.videoInfo?.year || ''
  const getDirector = () => detail?.videoInfo?.director || ''
  const getActor = () => detail?.videoInfo?.actor || ''
  const getArea = () => detail?.videoInfo?.area || ''
  const getContent = () => detail?.videoInfo?.desc || ''
  const getSourceName = () => detail?.videoInfo?.source_name || ''

  const pageRanges = useMemo(() => {
    const totalEpisodes = detail?.videoInfo?.episodes_names?.length || 0
    if (totalEpisodes === 0) return []

    const ranges: { label: string; value: string; start: number; end: number }[] = []

    if (isReversed) {
      for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
        const start = i
        const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
        const labelStart = totalEpisodes - start
        const labelEnd = totalEpisodes - end
        ranges.push({
          label: `${labelStart}-${labelEnd}`,
          value: `${start}-${end}`,
          start,
          end,
        })
      }
    } else {
      for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
        const start = i
        const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
        ranges.push({
          label: `${start + 1}-${end + 1}`,
          value: `${start}-${end}`,
          start,
          end,
        })
      }
    }

    return ranges
  }, [detail?.videoInfo?.episodes_names?.length, episodesPerPage, isReversed])

  const currentPageEpisodes = useMemo(() => {
    if (!currentPageRange || !detail?.videoInfo?.episodes_names) return []

    const [start, end] = currentPageRange.split('-').map(Number)
    const totalEpisodes = detail.videoInfo.episodes_names.length
    const episodes = detail.videoInfo.episodes_names

    if (isReversed) {
      const selectedEpisodes = []
      for (let i = start; i <= end; i++) {
        const actualIndex = totalEpisodes - 1 - i
        if (actualIndex >= 0 && actualIndex < totalEpisodes) {
          selectedEpisodes.push({
            name: episodes[actualIndex],
            displayIndex: i,
            actualIndex: actualIndex,
          })
        }
      }
      return selectedEpisodes
    } else {
      return episodes.slice(start, end + 1).map((name, idx) => ({
        name,
        displayIndex: start + idx,
        actualIndex: start + idx,
      }))
    }
  }, [currentPageRange, detail?.videoInfo?.episodes_names, isReversed])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!sourceCode || !vodId) return

      setLoading(true)
      try {
        const api = videoAPIs.find(api => api.id === sourceCode)
        if (!api) {
          throw new Error('API_NOT_FOUND')
        }

        const response = await apiService.getVideoDetail(vodId, api)
        setDetail(response)
      } catch (error) {
        console.error('Failed to fetch details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [sourceCode, vodId, videoAPIs])

  useEffect(() => {
    if (pageRanges.length === 0) return
    setCurrentPageRange(pageRanges[0].value)
  }, [pageRanges, isReversed])

  const handlePlayEpisode = (displayIndex: number) => {
    const actualIndex = isReversed
      ? (detail?.videoInfo?.episodes_names?.length || 0) - 1 - displayIndex
      : displayIndex
    navigate(`/video/${sourceCode}/${vodId}/${actualIndex}`)
  }

  // Matrix-style loading screen
  if (loading) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            {/* Cyber loader */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#003300] animate-spin" />
              <div
                className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#00FF41] animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '2s' }}
              />
              <div
                className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#00FF41]"
                style={{ boxShadow: '0 0 20px #00FF41' }}
              />
            </div>
            <div className="text-center">
              <p className="text-[#00FF41] font-mono text-sm animate-pulse tracking-wider">
                {'>'} FETCHING_DATA...
              </p>
              <p className="text-[#00FF41]/50 font-mono text-xs mt-2">
                PLEASE_WAIT...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!detail || detail.code !== 200) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
              style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}>
              ERROR: DATA_FETCH_FAILED
            </h2>
            <Button
              onPress={() => navigate(-1)}
              className="bg-transparent text-[#00FF41] border border-[#00FF41] font-mono uppercase tracking-wider hover:bg-[#00FF41]/10"
            >
              {'<'} GO_BACK
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 p-6 pb-20">
        {/* Main content */}
        <motion.div
          className="flex flex-col gap-6 lg:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cover - Desktop left */}
          <motion.div
            className="hidden lg:block lg:w-72"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="overflow-hidden rounded border border-[#00FF41]/30 bg-[#0D0D0D]"
              style={{
                boxShadow: '0 0 30px rgba(0, 255, 65, 0.1), inset 0 0 30px rgba(0, 255, 65, 0.02)',
              }}
            >
              <img
                src={getCover()}
                alt={getTitle()}
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Details panel - Terminal style */}
          <motion.div
            className="flex-1 rounded border border-[#00FF41]/20 bg-[#0D0D0D]/95 p-6 backdrop-blur-xl"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.05), inset 0 0 30px rgba(0, 255, 65, 0.02)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Mobile cover */}
            <div className="mb-6 lg:hidden">
              <div className="flex gap-4">
                <img
                  src={getCover()}
                  alt={getTitle()}
                  className="h-40 w-28 rounded border border-[#00FF41]/30 object-cover shadow-lg"
                />
                <div className="flex flex-col justify-between py-1">
                  <h1 className="text-xl font-bold text-[#00FF41] font-['Orbitron'] uppercase line-clamp-2 tracking-wider"
                    style={{ textShadow: '0 0 15px rgba(0, 255, 65, 0.5)' }}>
                    {getTitle()}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="tag-badge primary font-mono text-xs"
                      style={{
                        background: 'rgba(0, 255, 65, 0.15)',
                        color: '#00FF41',
                        border: '1px solid rgba(0, 255, 65, 0.4)',
                        boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
                      }}
                    >
                      {getSourceName()}
                    </span>
                    <span className="tag-badge font-mono text-xs">
                      {getYear()}
                    </span>
                    <span className="tag-badge font-mono text-xs">
                      {getType()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop title */}
            <h1
              className="hidden text-3xl font-bold text-[#00FF41] font-['Orbitron'] lg:block uppercase tracking-wider"
              style={{
                textShadow: '0 0 20px rgba(0, 255, 65, 0.5), 0 0 40px rgba(0, 255, 65, 0.3)',
              }}
            >
              {getTitle()}
            </h1>

            {/* Desktop tags */}
            <div className="mt-4 hidden flex-wrap gap-3 lg:flex">
              <span
                className="tag-badge primary font-mono text-xs"
                style={{
                  background: 'rgba(0, 255, 65, 0.15)',
                  color: '#00FF41',
                  border: '1px solid rgba(0, 255, 65, 0.4)',
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
                }}
              >
                {getSourceName()}
              </span>
              <span className="tag-badge font-mono text-xs">{getYear()}</span>
              <span className="tag-badge font-mono text-xs">{getType()}</span>
              {getArea() && (
                <span className="tag-badge font-mono text-xs">{getArea()}</span>
              )}
            </div>

            {/* Speed indicator */}
            {sourceCode && vodId && (
              <div className="mt-4">
                <SpeedIndicator
                  sourceCode={sourceCode}
                  vodId={vodId}
                  variant="expanded"
                />
              </div>
            )}

            {/* Director and actors */}
            <div className="mt-6 space-y-3 font-mono text-sm">
              {getDirector() && (
                <div className="flex items-start gap-3">
                  <span className="w-16 text-xs font-semibold text-[#00FF41] uppercase tracking-wider">Director</span>
                  <span className="text-[#00FF41]/80">{getDirector()}</span>
                </div>
              )}
              {getActor() && (
                <div className="flex items-start gap-3">
                  <span className="w-16 text-xs font-semibold text-[#00FF41] uppercase tracking-wider">Cast</span>
                  <span className="text-[#00FF41]/80 line-clamp-1">{getActor()}</span>
                </div>
              )}
            </div>

            {/* Description - Terminal details style */}
            {getContent() && (
              <details className="mt-6 group font-mono">
                <summary className="flex items-center gap-2 cursor-pointer text-[#00FF41]/70 hover:text-[#00FF41]">
                  <span className="text-xs font-semibold uppercase tracking-wider">{'>>'} Synopsis</span>
                  <ChevronDownIcon size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <div
                  className="mt-3 p-4 rounded border border-[#00FF41]/20 bg-[#001100]/50"
                  style={{ boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.05)' }}
                >
                  <p
                    className="text-sm leading-relaxed text-[#00FF41]/70"
                    dangerouslySetInnerHTML={{ __html: getContent() }}
                  />
                </div>
              </details>
            )}
          </motion.div>
        </motion.div>

        {/* Episode list */}
        {detail?.videoInfo?.episodes_names && detail.videoInfo.episodes_names.length > 0 && (
          <motion.div
            className="mt-8 rounded border border-[#00FF41]/20 bg-[#0D0D0D]/95 p-4 backdrop-blur-xl"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.05), inset 0 0 30px rgba(0, 255, 65, 0.02)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2
                  className="text-xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
                  style={{
                    textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
                  }}
                >
                  {'>>'} Episodes
                </h2>
                <span className="tag-badge font-mono text-xs">
                  TOTAL: {detail.videoInfo.episodes_names.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setIsReversed(!isReversed)}
                  startContent={isReversed ? <ArrowUpIcon size={18} /> : <ArrowDownIcon size={18} />}
                  className="text-[#00FF41]/70 hover:bg-[#00FF41]/10 hover:text-[#00FF41] border border-[#00FF41]/20 font-mono text-xs uppercase tracking-wider"
                >
                  {isReversed ? 'ASC' : 'DESC'}
                </Button>
                {pageRanges.length > 1 && (
                  <Select
                    size="sm"
                    selectedKeys={[currentPageRange]}
                    onChange={e => setCurrentPageRange(e.target.value)}
                    className="w-36"
                    classNames={{
                      trigger: 'bg-[#001100] backdrop-blur-md border border-[#00FF41]/30 text-[#00FF41] font-mono',
                      value: 'text-[#00FF41] font-mono',
                      popoverContent: 'bg-[#0D0D0D]/95 backdrop-blur-xl border border-[#00FF41]/20',
                    }}
                    aria-label="Select episode range"
                  >
                    {pageRanges.map(range => (
                      <SelectItem key={range.value} className="text-[#00FF41] font-mono">
                        {range.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              </div>
            </div>

            <Divider className="bg-[#00FF41]/10" />

            {/* Episode grid */}
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {currentPageEpisodes.map(({ name, displayIndex }, index) => (
                <motion.div
                  key={`${name}-${displayIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.02,
                    ease: 'easeOut',
                  }}
                >
                  <Tooltip content={name} placement="top" delay={500}>
                    <button
                      className="episode-btn w-full h-12 px-2 font-mono text-xs uppercase tracking-wider"
                      onClick={() => handlePlayEpisode(displayIndex)}
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
                    </button>
                  </Tooltip>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
