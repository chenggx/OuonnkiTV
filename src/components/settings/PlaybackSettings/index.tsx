import { useSettingStore } from '@/store/settingStore'
import { useApiStore } from '@/store/apiStore'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function PlaybackSettings() {
  const { playback, setPlaybackSettings } = useSettingStore()
  const { adFilteringEnabled, setAdFilteringEnabled } = useApiStore()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1
          className="text-xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
          style={{
            textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
          }}
        >
          {'>>'} 播放设置
        </h1>
        <p className="text-sm text-[#00FF41]/50 font-mono uppercase tracking-wider">
          自定义播放体验
        </p>
      </div>

      <div
        className="rounded border border-[#00FF41]/20 bg-[#001100]/50 p-5 backdrop-blur-sm"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.02)',
        }}
      >
        <h2 className="mb-4 text-sm font-medium text-[#00FF41]/80 font-mono uppercase tracking-wider">
          {'>'} 通用
        </h2>
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-row items-center justify-between rounded-lg border border-[#00FF41]/10 bg-[#001100]/50 p-4 transition-all hover:border-[#00FF41]/20"
          >
            <div className="space-y-0.5">
              <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">
                观看历史
              </Label>
              <p className="text-sm text-[#00FF41]/50 font-mono">
                自动记录播放进度
              </p>
            </div>
            <Switch
              checked={playback.isViewingHistoryEnabled}
              onCheckedChange={checked => setPlaybackSettings({ isViewingHistoryEnabled: checked })}
              className="[&>span:first-child]:data-[state=checked]:bg-[#00FF41] [&>span:first-child]:data-[state=checked]:shadow-[0_0_15px_rgba(0,255,65,0.5)] [&>span:last-child]:data-[state=checked]:bg-black"
            />
          </div>

          <div
            className="flex flex-row items-center justify-between rounded-lg border border-[#00FF41]/10 bg-[#001100]/50 p-4 transition-all hover:border-[#00FF41]/20"
          >
            <div className="space-y-0.5">
              <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">
                自动播放下一集
              </Label>
              <p className="text-sm text-[#00FF41]/50 font-mono">
                自动跳转到下一集
              </p>
            </div>
            <Switch
              checked={playback.isAutoPlayEnabled}
              onCheckedChange={checked => setPlaybackSettings({ isAutoPlayEnabled: checked })}
              className="[&>span:first-child]:data-[state=checked]:bg-[#00FF41] [&>span:first-child]:data-[state=checked]:shadow-[0_0_15px_rgba(0,255,65,0.5)] [&>span:last-child]:data-[state=checked]:bg-black"
            />
          </div>

          <div
            className="flex flex-row items-center justify-between rounded-lg border border-[#00FF41]/10 bg-[#001100]/50 p-4 transition-all hover:border-[#00FF41]/20"
          >
            <div className="space-y-0.5">
              <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">
                跳过广告片段
              </Label>
              <p className="text-sm text-[#00FF41]/50 font-mono">
                通过不连续标签检测并跳过广告
              </p>
            </div>
            <Switch
              checked={adFilteringEnabled}
              onCheckedChange={checked => setAdFilteringEnabled(checked)}
              className="[&>span:first-child]:data-[state=checked]:bg-[#00FF41] [&>span:first-child]:data-[state=checked]:shadow-[0_0_15px_rgba(0,255,65,0.5)] [&>span:last-child]:data-[state=checked]:bg-black"
            />
          </div>
        </div>
      </div>

      <div
        className="rounded border border-[#00FF41]/20 bg-[#001100]/50 p-5 backdrop-blur-sm"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.02)',
        }}
      >
        <h2 className="mb-4 text-sm font-medium text-[#00FF41]/80 font-mono uppercase tracking-wider">
          {'>'} 显示
        </h2>
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="order" className="text-sm text-[#00FF41]/80 font-mono uppercase tracking-wider">
              剧集排序
            </Label>
            <p className="text-xs text-[#00FF41]/40 font-mono">
              详情页默认排序方式
            </p>
          </div>
          <div className="w-[180px]">
            <Select
              value={playback.defaultEpisodeOrder}
              onValueChange={(value: 'asc' | 'desc') =>
                setPlaybackSettings({ defaultEpisodeOrder: value })
              }
            >
              <SelectTrigger
                id="order"
                className="border-[#00FF41]/20 bg-[#001100] text-[#00FF41] font-mono"
              >
                <SelectValue placeholder="选择排序" />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0D0D]/95 border border-[#00FF41]/20">
                <SelectItem
                  value="asc"
                  className="text-[#00FF41] hover:bg-[#00FF41]/10 focus:bg-[#00FF41]/10 font-mono"
                >
                  正序 (1, 2, 3...)
                </SelectItem>
                <SelectItem
                  value="desc"
                  className="text-[#00FF41] hover:bg-[#00FF41]/10 focus:bg-[#00FF41]/10 font-mono"
                >
                  倒序 (..., 3, 2, 1)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
