import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import Artplayer from 'artplayer'
import Hls, {
  type LoaderContext,
  type LoaderCallbacks,
  type LoaderResponse,
  type LoaderStats,
  type HlsConfig,
  type LoaderConfiguration,
} from 'hls.js'
import { Button, Tooltip, Select, SelectItem } from '@heroui/react'
import type { DetailResponse } from '@/types'
import { apiService } from '@/services/api.service'
import { useApiStore } from '@/store/apiStore'
import { useViewingHistoryStore } from '@/store/viewingHistoryStore'
import { useSettingStore } from '@/store/settingStore'
import { useDocumentTitle } from '@/hooks'
import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons'
import { PageBackground } from '@/components/ui/PageBackground'
import _ from 'lodash'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

function filterAdsFromM3U8(m3u8Content: string) {
  if (!m3u8Content) return ''
  const lines = m3u8Content.split('\n')
  const filteredLines = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.includes('#EXT-X-DISCONTINUITY')) {
      filteredLines.push(line)
    }
  }
  return filteredLines.join('\n')
}

interface ExtendedLoaderContext extends LoaderContext {
  type: string
}

interface ArtplayerWithHls extends Artplayer {
  hls?: Hls
}

class CustomHlsJsLoader extends Hls.DefaultConfig.loader {
  constructor(config: HlsConfig) {
    super(config)
    const load = this.load.bind(this)
    this.load = function (
      context: LoaderContext,
      config: LoaderConfiguration,
      callbacks: LoaderCallbacks<LoaderContext>,
    ) {
      const ctx = context as ExtendedLoaderContext
      if (ctx.type === 'manifest' || ctx.type === 'level') {
        const onSuccess = callbacks.onSuccess
        callbacks.onSuccess = function (
          response: LoaderResponse,
          stats: LoaderStats,
          context: LoaderContext,
          networkDetails: unknown,
        ) {
          if (response.data && typeof response.data === 'string') {
            response.data = filterAdsFromM3U8(response.data)
          }
          return onSuccess(response, stats, context, networkDetails)
        }
      }
      load(context, config, callbacks)
    }
  }
}

export default function Video() {
  const navigate = useNavigate()
  const { sourceCode, vodId, episodeIndex } = useParams<{
    sourceCode: string
    vodId: string
    episodeIndex: string
  }>()

  const playerRef = useRef<Artplayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { videoAPIs, adFilteringEnabled } = useApiStore()
  const { addViewingHistory, viewingHistory } = useViewingHistoryStore()
  const { playback } = useSettingStore()

  const viewingHistoryRef = useRef(viewingHistory)
  const playbackRef = useRef(playback)

  useEffect(() => {
    viewingHistoryRef.current = viewingHistory
    playbackRef.current = playback
  }, [viewingHistory, playback])

  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(() => {
    const index = parseInt(episodeIndex || '0')
    return isNaN(index) ? 0 : index
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const getTitle = () => detail?.videoInfo?.title || 'UNKNOWN_VIDEO'
  const sourceName = detail?.videoInfo?.source_name || 'UNKNOWN_SOURCE'

  const pageTitle = useMemo(() => {
    const title = detail?.videoInfo?.title
    if (title) {
      return `${title}`
    }
    return 'VIDEO_PLAYBACK'
  }, [detail?.videoInfo?.title])

  useDocumentTitle(pageTitle)

  useEffect(() => {
    const fetchVideoDetail = async () => {
      if (!sourceCode || !vodId) {
        setError('MISSING_PARAMETERS')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const api = videoAPIs.find(api => api.id === sourceCode)
        if (!api) {
          throw new Error('API_CONFIG_NOT_FOUND')
        }

        const response = await apiService.getVideoDetail(vodId, api)

        if (response.code === 200 && response.episodes && response.episodes.length > 0) {
          setDetail(response)
        } else {
          throw new Error(response.msg || 'FAILED_TO_GET_VIDEO_INFO')
        }
      } catch (err) {
        console.error('Failed to fetch video:', err)
        setError(err instanceof Error ? err.message : 'FAILED_TO_FETCH_VIDEO')
      } finally {
        setLoading(false)
      }
    }

    fetchVideoDetail()
  }, [sourceCode, vodId, videoAPIs])

  useEffect(() => {
    const urlEpisodeIndex = parseInt(episodeIndex || '0')
    if (!isNaN(urlEpisodeIndex) && urlEpisodeIndex !== selectedEpisode) {
      setSelectedEpisode(urlEpisodeIndex)
    }
  }, [episodeIndex, selectedEpisode])

  useEffect(() => {
    if (!detail?.episodes || !detail.episodes[selectedEpisode] || !containerRef.current) return

    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy(false)
    }

    const nextEpisode = () => {
      if (!playbackRef.current.isAutoPlayEnabled) return

      const total = detail.videoInfo?.episodes_names?.length || 0
      if (selectedEpisode < total - 1) {
        const nextIndex = selectedEpisode + 1
        setSelectedEpisode(nextIndex)
        navigate(`/video/${sourceCode}/${vodId}/${nextIndex}`, {
          replace: true,
        })
        toast.info(`NEXT_EPISODE: ${detail.videoInfo?.episodes_names?.[nextIndex]}`)
      }
    }

    const art = new Artplayer({
      container: containerRef.current,
      url: detail.episodes[selectedEpisode],
      volume: 0.7,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      airplay: true,
      theme: '#00FF41', // Matrix green
      lang: 'zh-cn',
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
      customType: {
        m3u8: function (video: HTMLMediaElement, url: string, art: Artplayer) {
          const artWithHls = art as ArtplayerWithHls
          if (Hls.isSupported()) {
            if (artWithHls.hls) artWithHls.hls.destroy()
            const hlsConfig: Partial<HlsConfig> = adFilteringEnabled
              ? { loader: CustomHlsJsLoader as unknown as typeof Hls.DefaultConfig.loader }
              : {}
            const hls = new Hls(hlsConfig)
            hls.loadSource(url)
            hls.attachMedia(video)
            artWithHls.hls = hls
            art.on('destroy', () => hls.destroy())
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url
          } else {
            art.notice.show = 'UNSUPPORTED_FORMAT:_M3U8'
          }
        },
      },
    })

    playerRef.current = art

    art.on('ready', () => {
      const existingHistory = viewingHistoryRef.current.find(
        item =>
          item.sourceCode === sourceCode &&
          item.vodId === vodId &&
          item.episodeIndex === selectedEpisode,
      )
      if (existingHistory && existingHistory.playbackPosition > 0) {
        art.seek = existingHistory.playbackPosition
        toast.success('RESUMED_FROM_LAST_POSITION')
      }
    })

    const normalAddHistory = () => {
      if (!sourceCode || !vodId || !detail?.videoInfo) return
      addViewingHistory({
        title: detail.videoInfo.title || 'UNKNOWN_VIDEO',
        imageUrl: detail.videoInfo.cover || '',
        sourceCode: sourceCode || '',
        sourceName: detail.videoInfo.source_name || '',
        vodId: vodId || '',
        episodeIndex: selectedEpisode,
        episodeName: detail.videoInfo.episodes_names?.[selectedEpisode],
        playbackPosition: art.currentTime || 0,
        duration: art.duration || 0,
        timestamp: Date.now(),
      })
    }

    art.on('video:play', normalAddHistory)
    art.on('video:pause', normalAddHistory)
    art.on('video:ended', () => {
      normalAddHistory()
      nextEpisode()
    })
    art.on('video:error', normalAddHistory)

    let lastTimeUpdate = 0
    const TIME_UPDATE_INTERVAL = 3000

    const timeUpdateHandler = () => {
      if (!sourceCode || !vodId || !detail?.videoInfo) return
      const currentTime = art.currentTime || 0
      const duration = art.duration || 0
      const timeSinceLastUpdate = Date.now() - lastTimeUpdate

      if (timeSinceLastUpdate >= TIME_UPDATE_INTERVAL && currentTime > 0 && duration > 0) {
        lastTimeUpdate = Date.now()
        addViewingHistory({
          title: detail.videoInfo.title || 'UNKNOWN_VIDEO',
          imageUrl: detail.videoInfo.cover || '',
          sourceCode: sourceCode || '',
          sourceName: detail.videoInfo.source_name || '',
          vodId: vodId || '',
          episodeIndex: selectedEpisode,
          episodeName: detail.videoInfo.episodes_names?.[selectedEpisode],
          playbackPosition: currentTime,
          duration: duration,
          timestamp: Date.now(),
        })
      }
    }

    art.on('video:timeupdate', _.throttle(timeUpdateHandler, TIME_UPDATE_INTERVAL))

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        normalAddHistory()
        playerRef.current.destroy(false)
        playerRef.current = null
      }
    }
  }, [selectedEpisode, detail, sourceCode, vodId, addViewingHistory, navigate, adFilteringEnabled])

  const handleEpisodeChange = (displayIndex: number) => {
    const actualIndex = isReversed
      ? (detail?.videoInfo?.episodes_names?.length || 0) - 1 - displayIndex
      : displayIndex
    setSelectedEpisode(actualIndex)
    navigate(`/video/${sourceCode}/${vodId}/${actualIndex}`, {
      replace: true,
    })
  }

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

  useEffect(() => {
    if (pageRanges.length === 0 || !detail?.videoInfo?.episodes_names) return

    const totalEpisodes = detail.videoInfo.episodes_names.length
    const actualSelectedIndex = selectedEpisode
    const displayIndex = isReversed ? totalEpisodes - 1 - actualSelectedIndex : actualSelectedIndex

    const rangeContainingSelected = pageRanges.find(
      range => displayIndex >= range.start && displayIndex <= range.end,
    )

    if (rangeContainingSelected) {
      setCurrentPageRange(rangeContainingSelected.value)
    } else {
      setCurrentPageRange(pageRanges[0].value)
    }
  }, [pageRanges, selectedEpisode, isReversed, detail?.videoInfo?.episodes_names])

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

  // Matrix-style loading screen
  if (loading) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#003300] animate-spin" />
              <div
                className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#00FF41] animate-spin"
                style={{ animationDuration: '1.5s' }}
              />
              <div
                className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#00FF41]"
                style={{ boxShadow: '0 0 20px #00FF41' }}
              />
            </div>
            <div className="text-center">
              <p className="text-[#00FF41] font-mono text-sm animate-pulse tracking-wider">
                {'>'} LOADING_STREAM...
              </p>
              <p className="text-[#00FF41]/50 font-mono text-xs mt-2">
                ESTABLISHING_CONNECTION...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded border border-[#FF0040]/30 bg-[#0D0D0D]/95 p-8 text-center backdrop-blur-xl"
            style={{
              boxShadow: '0 0 30px rgba(255, 0, 64, 0.2)',
            }}
          >
            <h2 className="mb-4 text-xl font-bold text-[#FF0040] font-['Orbitron'] uppercase tracking-wider">
              ERROR: {error}
            </h2>
            <Button
              onPress={() => navigate(-1)}
              className="bg-transparent text-[#00FF41] border border-[#00FF41] font-mono uppercase tracking-wider hover:bg-[#00FF41]/10"
            >
              {'<'} GO_BACK
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!detail || !detail.episodes || detail.episodes.length === 0) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded border border-[#00FF41]/30 bg-[#0D0D0D]/95 p-8 text-center backdrop-blur-xl"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.1)',
            }}
          >
            <h2 className="mb-4 text-xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider">
              STREAM_INFO_UNAVAILABLE
            </h2>
            <Button
              onPress={() => navigate(-1)}
              className="bg-transparent text-[#00FF41] border border-[#00FF41] font-mono uppercase tracking-wider hover:bg-[#00FF41]/10"
            >
              {'<'} GO_BACK
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 p-4 pb-24 md:p-6 md:pb-20">
        {/* Top info bar */}
        <div className="mb-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onPress={() => navigate(-1)}
              className="border border-[#00FF41]/30 bg-[#001100]/50 text-[#00FF41]/70 hover:bg-[#00FF41]/10 hover:text-[#00FF41] hover:border-[#00FF41]/50 font-mono text-xs uppercase tracking-wider"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              BACK
            </Button>
            <div>
              <p className="text-xs text-[#00FF41]/60 font-mono uppercase tracking-wider">{sourceName}</p>
              <h4
                className="text-lg font-bold text-[#00FF41] line-clamp-1 font-['Orbitron'] uppercase tracking-wider"
                style={{
                  textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
                }}
              >
                {getTitle()}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span
              className="tag-badge primary"
              style={{
                background: 'rgba(0, 255, 65, 0.15)',
                color: '#00FF41',
                border: '1px solid rgba(0, 255, 65, 0.4)',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
              }}
            >
              EP {selectedEpisode + 1}
            </span>
            <span className="text-xs text-[#00FF41]/50">
              / {detail.episodes.length} TOTAL
            </span>
          </div>
        </div>

        {/* Player container - Terminal style */}
        <div
          className="mb-6 overflow-hidden rounded border border-[#00FF41]/30 bg-[#0D0D0D] shadow-[0_0_30px_rgba(0,255,65,0.1)]"
          style={{
            boxShadow: '0 0 30px rgba(0, 255, 65, 0.1), inset 0 0 30px rgba(0, 255, 65, 0.02)',
          }}
        >
          <div
            id="player"
            ref={containerRef}
            className="aspect-video w-full"
          />
        </div>

        {/* Episode list */}
        {detail.videoInfo?.episodes_names && detail.videoInfo?.episodes_names.length > 0 && (
          <div>
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

            {/* Episode grid */}
            <div
              className="grid grid-cols-4 gap-3 rounded border border-[#00FF41]/20 bg-[#0D0D0D]/80 p-4 backdrop-blur-xl sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
              style={{
                boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.02)',
              }}
            >
              {currentPageEpisodes.map(({ name, displayIndex, actualIndex }) => (
                <Tooltip key={`${name}-${displayIndex}`} content={name} placement="top" delay={500}>
                  <button
                    className={`
                      w-full h-12 px-2 rounded font-mono text-xs uppercase tracking-wider
                      transition-all duration-200
                      ${selectedEpisode === actualIndex
                        ? 'episode-btn selected'
                        : 'episode-btn'
                      }
                    `}
                    onClick={() => handleEpisodeChange(displayIndex)}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Mobile bottom fixed play bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent md:hidden">
          <button
            className="w-full h-14 rounded border-2 border-[#00FF41] bg-transparent text-[#00FF41] font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-[#00FF41]/10 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
            }}
            onClick={() => navigate(`/video/${sourceCode}/${vodId}/${selectedEpisode}`)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            PLAY_EP {selectedEpisode + 1}
          </button>
        </div>
      </div>
    </div>
  )
}
