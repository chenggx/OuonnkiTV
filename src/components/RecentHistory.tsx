import { CloseIcon, NoItemIcon, RecentIcon, TrashIcon } from '@/components/icons'
import { Card, Chip, Image, Tooltip, Progress } from '@heroui/react'
import { ScrollShadow } from '@heroui/react'
import { useViewingHistoryStore } from '@/store/viewingHistoryStore'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { NavLink } from 'react-router'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { isBrowser } from 'react-device-detect'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { ViewingHistoryItem } from '@/types'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
dayjs.extend(duration)

// Format episode display
const formatEpisodeDisplay = (item: ViewingHistoryItem): string => {
  if (item.episodeName) {
    return item.episodeName
  }
  return `EP_${item.episodeIndex + 1}`
}

const HistoryList = ({
  viewingHistory,
  removeViewingHistory,
}: {
  viewingHistory: ViewingHistoryItem[]
  removeViewingHistory: (item: ViewingHistoryItem) => void
}) => {
  const filteredHistory = useMemo(() => {
    const historyMap = new Map()
    viewingHistory.forEach(item => {
      const key = `${item.sourceCode}-${item.vodId}`
      if (!historyMap.has(key)) {
        historyMap.set(key, item)
      }
    })
    return Array.from(historyMap.values())
  }, [viewingHistory])

  if (filteredHistory.length === 0) {
    return (
      <div className="mt-5 flex flex-col items-center justify-center gap-4">
        <div
          className="opacity-30"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 65, 0.3))' }}
        >
          <NoItemIcon size={80} />
        </div>
        <p className="mt-2 text-sm text-[#00FF41]/50 font-mono uppercase tracking-wider">
          {'>'} NO_HISTORY_FOUND...
        </p>
      </div>
    )
  }

  return (
    <>
      <ScrollShadow hideScrollBar className="max-h-[50vh] overflow-y-auto bg-transparent p-2">
        {filteredHistory.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="mb-[.6rem] w-full transition-all duration-300 hover:scale-[1.01]"
              isPressable
              shadow="sm"
              onPress={() => console.log('item pressed')}
              classNames={{
                base: 'bg-[#0D0D0D] border border-[#00FF41]/20 hover:border-[#00FF41]/40 transition-all duration-300',
              }}
            >
              <NavLink
                className="w-full"
                to={`/video/${item.sourceCode}/${item.vodId}/${item.episodeIndex}`}
              >
                <div className="flex h-[30vw] w-full md:h-[8rem]">
                  <div className="relative shrink-0">
                    <Image
                      alt={item.title}
                      radius="sm"
                      shadow="sm"
                      loading="lazy"
                      classNames={{
                        wrapper: 'h-full aspect-square',
                        img: 'h-full w-full object-cover',
                      }}
                      src={item.imageUrl}
                      className="border border-[#00FF41]/10"
                    />
                    <Progress
                      aria-label="Progress"
                      value={(item.playbackPosition / item.duration) * 100}
                      className="absolute bottom-0 z-10 w-full"
                      classNames={{
                        base: 'h-[1.5cqw]',
                        indicator: 'bg-[#00FF41]',
                      }}
                    />
                  </div>
                  <div className="group flex h-full w-full flex-col items-start justify-between p-[4cqw] md:gap-3 md:p-4">
                    <div className="flex w-full items-center justify-between gap-[2cqw] md:gap-2">
                      <Chip
                        classNames={{
                          base: 'h-[6cqw] px-[3%] md:h-6 md:px-2 border border-[#00FF41]/30 bg-[#001100]',
                          content: 'text-[3cqw] md:text-xs text-[#00FF41] font-mono uppercase',
                        }}
                      >
                        {item.sourceName}
                      </Chip>
                      <div className="flex items-center justify-center gap-[.6rem] text-[3.5cqw] text-[#00FF41]/40 md:text-xs">
                        <p className="font-mono">{dayjs(item.timestamp).fromNow()}</p>
                        <motion.div
                          initial={{ color: '#00FF41', backgroundColor: 'transparent' }}
                          whileHover={{ color: '#FF0040', backgroundColor: 'rgba(255, 0, 64, 0.1)' }}
                          transition={{ duration: 0.4 }}
                          className="flex h-[1.5rem] w-[1.5rem] items-center justify-center rounded"
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeViewingHistory(item)
                          }}
                        >
                          <TrashIcon size={14} />
                        </motion.div>
                      </div>
                    </div>
                    <div
                      className="line-clamp-1 text-[4.5cqw] font-bold text-[#00FF41] transition-colors duration-200 group-hover:underline md:text-base uppercase tracking-wider font-['Orbitron']"
                      style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}
                    >
                      {item.title}
                    </div>
                    <div className="flex w-full items-center justify-between gap-[2cqw] text-[3cqw] md:gap-2 md:text-xs font-mono">
                      <div className="text-[#00FF41]/50">{formatEpisodeDisplay(item)}</div>
                      <div className="text-[#00FF41]/50">
                        {((item.playbackPosition / item.duration) * 100).toFixed(0)}% WATCHED
                      </div>
                    </div>
                  </div>
                </div>
              </NavLink>
            </Card>
          </motion.div>
        ))}
        <div className="mt-5 flex items-center justify-center">
          <p className="text-sm text-[#00FF41]/30 font-mono uppercase tracking-wider">
            {'>'} END_OF_HISTORY
          </p>
        </div>
      </ScrollShadow>
    </>
  )
}

export default function RecentHistory() {
  const [isOpen, setIsOpen] = useState(false)
  const { viewingHistory, removeViewingHistory, clearViewingHistory } = useViewingHistoryStore()
  return (
    <>
      <Tooltip
        isOpen={isBrowser ? undefined : false}
        classNames={{
          base: 'bg-transparent',
          content:
            'flex justify-start min-h-[40vh] max-h-[60vh] p-2 border border-[#00FF41]/20 bg-[#0D0D0D]/95 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,65,0.1)]',
        }}
        content={
          <>
            <div className="h-full">
              <div className="mt-2 mb-2 flex w-full items-end justify-between">
                <div className="flex-1"></div>
                <div
                  className="text-center text-lg font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
                  style={{ textShadow: '0 0 15px rgba(0, 255, 65, 0.5)' }}
                >
                  {'>>'} HISTORY
                </div>
                <div className="flex flex-1 items-center justify-end">
                  {viewingHistory.length > 0 && (
                    <motion.div
                      initial={{ color: '#00FF41' }}
                      whileHover={{ color: '#FF0040' }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-center gap-1 pr-3 hover:cursor-pointer font-mono text-xs uppercase tracking-wider"
                      onClick={clearViewingHistory}
                    >
                      <CloseIcon size={16} />
                      <p>CLEAR</p>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="min-w-[25rem]">
                <HistoryList
                  viewingHistory={viewingHistory}
                  removeViewingHistory={removeViewingHistory}
                />
              </div>
            </div>
          </>
        }
        shadow="lg"
        placement="bottom"
        offset={30}
      >
        <div
          onClick={isBrowser ? undefined : () => setIsOpen(!isOpen)}
          className="flex h-full w-full items-center justify-center"
        >
          <RecentIcon size={24} />
        </div>
      </Tooltip>
      {!isBrowser &&
        isOpen &&
        createPortal(
          <div
            className={clsx(
              'fixed inset-0 z-50 flex flex-col items-center justify-center border border-[#00FF41]/20 bg-black/90 backdrop-blur-xl transition-opacity duration-2000',
              isOpen && 'opacity-100',
            )}
            style={{
              boxShadow: 'inset 0 0 100px rgba(0, 255, 65, 0.05)',
            }}
            onClick={() => setIsOpen(false)}
          >
            <div className="flex h-[90vh] w-[90vw] flex-col items-center justify-start">
              <div className="mt-[5vh] mb-2 flex h-fit w-full items-end justify-between px-4">
                <div className="flex-1"></div>
                <div
                  className="text-center text-2xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
                  style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
                >
                  {'>>'} HISTORY
                </div>
                <div className="flex flex-1 items-center justify-end">
                  {viewingHistory.length > 0 && (
                    <motion.div
                      initial={{ color: '#00FF41' }}
                      whileHover={{ color: '#FF0040' }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-center gap-1 font-mono text-sm uppercase tracking-wider"
                      onClick={e => {
                        e.stopPropagation()
                        clearViewingHistory()
                      }}
                    >
                      <CloseIcon size={20} />
                      <p>CLEAR</p>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <HistoryList
                  viewingHistory={viewingHistory}
                  removeViewingHistory={removeViewingHistory}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
