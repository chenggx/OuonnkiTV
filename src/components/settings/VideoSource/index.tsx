import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CircleX, CircleCheckBig, ChevronRight } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils'
import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useApiStore } from '@/store/apiStore'
import { useSettingStore } from '@/store/settingStore'
import dayjs from 'dayjs'
import ActionDropdown from '@/components/common/ActionDropdown'
import VideoSourceForm from './VideoSourceForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { v4 as uuidv4 } from 'uuid'
import { URLSourceModal, TextSourceModal } from './ImportSourceModal'

export default function VideoSource() {
  const {
    selectAllAPIs,
    deselectAllAPIs,
    videoAPIs,
    setApiEnabled,
    getSelectedAPIs,
    importVideoAPIs,
  } = useApiStore()
  const [showVideoAPIs, setShowVideoAPIs] = useState(videoAPIs)
  useEffect(() => {
    setShowVideoAPIs(videoAPIs)
  }, [videoAPIs])
  const isAllSelected = getSelectedAPIs().length === showVideoAPIs.length
  const handleToggleAll = () => {
    if (isAllSelected) {
      deselectAllAPIs()
    } else {
      selectAllAPIs()
    }
  }
  const [selectedIndex, setSelectedIndex] = useState(0)

  const safeIndex = Math.min(selectedIndex, Math.max(0, showVideoAPIs.length - 1))
  const selectedSource = showVideoAPIs[safeIndex]

  useEffect(() => {
    if (selectedIndex !== safeIndex) {
      setSelectedIndex(safeIndex)
    }
  }, [selectedIndex, safeIndex])

  const addVideoSource = () => {
    setShowVideoAPIs([
      ...showVideoAPIs,
      {
        id: uuidv4(),
        name: 'NEW_SOURCE',
        url: '',
        detailUrl: '',
        timeout: useSettingStore.getState().network.defaultTimeout || 3000,
        retry: useSettingStore.getState().network.defaultRetry || 3,
        isEnabled: true,
        updatedAt: new Date(),
      },
    ])
    setSelectedIndex(showVideoAPIs.length)
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addVideoSourceFromJSONFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const content = e.target?.result as string
        const sources = JSON.parse(content)
        if (Array.isArray(sources)) {
          importVideoAPIs(sources)
          toast.success(`IMPORTED_${sources.length}_SOURCES`)
        } else {
          toast.error('IMPORT_FAILED: INVALID_FORMAT')
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('IMPORT_FAILED: JSON_PARSE_ERROR')
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const [urlSourceModalOpen, setUrlSourceModalOpen] = useState(false)
  const addVideoSourceFromURL = () => {
    setUrlSourceModalOpen(true)
  }

  const [textSourceModalOpen, setTextSourceModalOpen] = useState(false)
  const addVideoSourceFromText = () => {
    setTextSourceModalOpen(true)
  }

  const handleExportToFile = () => {
    try {
      const data = JSON.stringify(videoAPIs, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ouonnki-tv-sources-${dayjs().format('YYYY-MM-DD')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('EXPORT_SUCCESS')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('EXPORT_FAILED')
    }
  }

  const handleExportToText = async () => {
    try {
      const data = JSON.stringify(videoAPIs, null, 2)
      await navigator.clipboard.writeText(data)
      toast.success('COPIED_TO_CLIPBOARD')
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('COPY_FAILED')
    }
  }

  return (
    <>
      <URLSourceModal open={urlSourceModalOpen} onOpenChange={setUrlSourceModalOpen} />
      <TextSourceModal open={textSourceModalOpen} onOpenChange={setTextSourceModalOpen} />
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-5">
          <div className="flex flex-col gap-1">
            <h1
              className="text-xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
              style={{
                textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
              }}
            >
              {'>>'} 视频源
            </h1>
            <p className="text-sm text-[#00FF41]/50 font-mono uppercase tracking-wider">
              管理视频源
            </p>
          </div>
          <ActionDropdown
            label="添加源"
            items={[
              {
                label: '手动添加',
                onClick: addVideoSource,
              },
              {
                label: '导入源',
                type: 'sub',
                children: [
                  {
                    label: '从文件导入',
                    onClick: addVideoSourceFromJSONFile,
                  },
                  {
                    label: '从URL导入',
                    onClick: addVideoSourceFromURL,
                  },
                  {
                    label: '从文本导入',
                    onClick: addVideoSourceFromText,
                  },
                ],
              },
              {
                label: '导出源',
                type: 'sub',
                children: [
                  {
                    label: '导出到文件',
                    onClick: handleExportToFile,
                  },
                  {
                    label: '导出到文本',
                    onClick: handleExportToText,
                  },
                ],
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          {/* Sidebar list */}
          <div className="hidden w-60 flex-col md:flex">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-sm text-[#00FF41]/50 font-mono">
                已启用 {getSelectedAPIs().length}/{videoAPIs.length}
              </p>
              <Button
                onClick={handleToggleAll}
                variant="ghost"
                disabled={showVideoAPIs.length === 0}
                className="text-[#00FF41]/60 hover:bg-[#00FF41]/10 hover:text-[#00FF41] font-mono text-xs uppercase tracking-wider border border-transparent hover:border-[#00FF41]/30"
              >
                {isAllSelected ? <CircleX className="h-4 w-4" /> : <CircleCheckBig className="h-4 w-4" />}
                {isAllSelected ? '全部禁用' : '全部启用'}
              </Button>
            </div>
            <ScrollArea
              className="flex-1 rounded border border-[#00FF41]/20 bg-[#0D0D0D]/80 p-3"
            >
              <div className="flex max-h-155 flex-col gap-2">
                {showVideoAPIs.length === 0 && (
                  <div className="flex h-full items-center justify-center py-8">
                    <p className="text-[#00FF41]/40 font-mono text-sm uppercase tracking-wider">
                      {'>'} 未找到视频源
                    </p>
                  </div>
                )}
                {showVideoAPIs.map((source, index) => (
                  <div
                    className={cn(
                      'flex h-11 items-center justify-between rounded px-3 cursor-pointer transition-all font-mono text-xs uppercase tracking-wider',
                      selectedSource?.id === source.id
                        ? 'bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]'
                        : 'hover:bg-[#00FF41]/5 border border-transparent text-[#00FF41]/50 hover:text-[#00FF41]/70',
                    )}
                    key={source.id}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <p className={cn('text-sm truncate')}>{source.name}</p>
                    <Switch
                      onClick={e => e.stopPropagation()}
                      onCheckedChange={() => setApiEnabled(source.id, !source.isEnabled)}
                      checked={source.isEnabled}
                      className="[&>span:first-child]:data-[state=checked]:bg-[#00FF41] [&>span:first-child]:data-[state=checked]:shadow-[0_0_10px_rgba(0,255,65,0.4)] [&>span:last-child]:data-[state=checked]:bg-black"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Detail edit area */}
          <div
            className="flex h-full flex-1 flex-col rounded border border-[#00FF41]/20 bg-[#0D0D0D]/80 p-4"
            style={{
              boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.02)',
            }}
          >
            {selectedSource ? (
              <>
                <div className="mb-4 flex items-center justify-between border-b border-[#00FF41]/10 pb-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider">
                      {selectedSource.name}
                    </h2>
                    <p className="text-xs text-[#00FF41]/40 font-mono">
                      UPDATED: {dayjs(selectedSource.updatedAt).format('YYYY-MM-DD_HH:mm:ss')}
                    </p>
                  </div>
                  {/* Mobile source switcher */}
                  <div className="md:hidden">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="border border-[#00FF41]/30 bg-[#001100]/50 text-[#00FF41]/70 hover:bg-[#00FF41]/10 font-mono text-xs uppercase tracking-wider"
                        >
                          切换
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0D0D0D]/95 border border-[#00FF41]/20 backdrop-blur-xl">
                        <DialogHeader>
                          <DialogTitle className="text-[#00FF41] font-['Orbitron'] uppercase tracking-wider">
                            选择视频源
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center justify-between py-2">
                          <p className="text-sm text-[#00FF41]/50 font-mono">
                            已启用 {getSelectedAPIs().length}/{videoAPIs.length}
                          </p>
                          <Button
                            onClick={handleToggleAll}
                            variant="ghost"
                            disabled={showVideoAPIs.length === 0}
                            className="text-[#00FF41]/60 hover:bg-[#00FF41]/10 font-mono text-xs uppercase tracking-wider"
                          >
                            {isAllSelected ? '全部禁用' : '全部启用'}
                          </Button>
                        </div>
                        <ScrollArea className="flex-1 rounded-lg">
                          <div className="flex flex-col gap-2 py-2">
                            {showVideoAPIs.map((source, index) => (
                              <div
                                className={cn(
                                  'flex h-12 items-center justify-between rounded border px-4 py-2 cursor-pointer transition-all font-mono text-xs uppercase',
                                  selectedSource?.id === source.id
                                    ? 'border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41]'
                                    : 'border-[#00FF41]/10 hover:bg-[#00FF41]/5 text-[#00FF41]/60',
                                )}
                                key={source.id}
                                onClick={() => setSelectedIndex(index)}
                              >
                                <p className={cn('text-sm font-medium truncate')}>
                                  {source.name}
                                </p>
                                <Switch
                                  onClick={e => e.stopPropagation()}
                                  onCheckedChange={() => setApiEnabled(source.id, !source.isEnabled)}
                                  checked={source.isEnabled}
                                  className="[&>span:first-child]:data-[state=checked]:bg-[#00FF41] [&>span:first-child]:data-[state=checked]:shadow-[0_0_10px_rgba(0,255,65,0.4)] [&>span:last-child]:data-[state=checked]:bg-black"
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <VideoSourceForm sourceInfo={selectedSource} />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-[#00FF41]/40 font-mono text-sm uppercase tracking-wider">
                {'>'} 选择或添加视频源
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleFileChange}
        />
      </div>
    </>
  )
}
