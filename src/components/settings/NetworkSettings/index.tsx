import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingStore } from '@/store/settingStore'

export default function NetworkSettings() {
  const { network, setNetworkSettings } = useSettingStore()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1
          className="text-xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
          style={{
            textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
          }}
        >
          {'>>'} 网络设置
        </h1>
        <p className="text-sm text-[#00FF41]/50 font-mono uppercase tracking-wider">
          配置全局网络参数
        </p>
      </div>

      <div
        className="rounded border border-[#00FF41]/20 bg-[#001100]/50 p-5 backdrop-blur-sm"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.02)',
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="grid w-full max-w-sm items-start gap-2">
            <Label htmlFor="timeout" className="text-sm text-[#00FF41]/80 font-mono uppercase tracking-wider">
              超时时间 (毫秒)
            </Label>
            <Input
              type="number"
              id="timeout"
              value={network.defaultTimeout}
              onChange={e => setNetworkSettings({ defaultTimeout: parseInt(e.target.value) || 0 })}
              className="border-[#00FF41]/20 bg-[#001100] text-[#00FF41] placeholder:text-[#00FF41]/30 focus:border-[#00FF41]/50 font-mono"
            />
            <p className="text-xs text-[#00FF41]/40 font-mono">
              所有视频源的默认超时时间
            </p>
          </div>

          <div className="grid w-full max-w-sm items-start gap-2">
            <Label htmlFor="retry" className="text-sm text-[#00FF41]/80 font-mono uppercase tracking-wider">
              重试次数
            </Label>
            <Input
              type="number"
              id="retry"
              value={network.defaultRetry}
              onChange={e => setNetworkSettings({ defaultRetry: parseInt(e.target.value) || 0 })}
              className="border-[#00FF41]/20 bg-[#001100] text-[#00FF41] placeholder:text-[#00FF41]/30 focus:border-[#00FF41]/50 font-mono"
            />
            <p className="text-xs text-[#00FF41]/40 font-mono">
              失败时的自动重试次数
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
