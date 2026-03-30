import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useSettingStore } from '@/store/settingStore'
import { useSearchStore } from '@/store/searchStore'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export default function SearchSettings() {
  const { search, setSearchSettings } = useSettingStore()
  const { clearSearchResultsCache, searchResultsCache, removeSearchResultsCacheItem } =
    useSearchStore()

  const handleClearCache = () => {
    clearSearchResultsCache()
    toast.success('CACHE_CLEARED')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1
          className="text-xl font-bold text-[#00FF41] font-['Orbitron'] uppercase tracking-wider"
          style={{
            textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
          }}
        >
          {'>>'} 搜索设置
        </h1>
        <p className="text-sm text-[#00FF41]/50 font-mono uppercase tracking-wider">
          管理搜索历史和缓存
        </p>
      </div>

      <div
        className="rounded border border-[#00FF41]/20 bg-[#001100]/50 p-5 backdrop-blur-sm"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.02)',
        }}
      >
        <h2 className="mb-4 text-sm font-medium text-[#00FF41]/80 font-mono uppercase tracking-wider">
          {'>'} 历史设置
        </h2>
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-row items-center justify-between rounded-lg border border-[#00FF41]/10 bg-[#001100]/50 p-4 transition-all hover:border-[#00FF41]/20"
          >
            <div className="space-y-0.5">
              <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">
                启用历史
              </Label>
              <p className="text-sm text-[#00FF41]/50 font-mono">
                记录搜索关键词
              </p>
            </div>
            <Switch
              checked={search.isSearchHistoryEnabled}
              onCheckedChange={checked => setSearchSettings({ isSearchHistoryEnabled: checked })}
              className="[&>span:first-child]:data-[state=checked]:bg-[#00FF41] [&>span:first-child]:data-[state=checked]:shadow-[0_0_15px_rgba(0,255,65,0.5)] [&>span:last-child]:data-[state=checked]:bg-black"
            />
          </div>
          <div
            className="flex flex-row items-center justify-between rounded-lg border border-[#00FF41]/10 bg-[#001100]/50 p-4 transition-all hover:border-[#00FF41]/20"
          >
            <div className="space-y-0.5">
              <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">
                显示历史
              </Label>
              <p className="text-sm text-[#00FF41]/50 font-mono">
                聚焦时显示搜索历史
              </p>
            </div>
            <Switch
              checked={search.isSearchHistoryVisible}
              onCheckedChange={checked => setSearchSettings({ isSearchHistoryVisible: checked })}
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
          {'>'} 缓存管理
        </h2>
        <div className="flex flex-col gap-5">
          <div className="grid w-full max-w-sm items-start gap-2">
            <Label htmlFor="expiry" className="text-sm text-[#00FF41]/80 font-mono uppercase tracking-wider">
              缓存过期时间 (小时)
            </Label>
            <Input
              type="number"
              id="expiry"
              value={search.searchCacheExpiryHours}
              onChange={e => {
                const val = parseFloat(e.target.value)
                setSearchSettings({ searchCacheExpiryHours: isNaN(val) ? 0 : val })
              }}
              className="border-[#00FF41]/20 bg-[#001100] text-[#00FF41] placeholder:text-[#00FF41]/30 focus:border-[#00FF41]/50 font-mono"
            />
            <p className="text-xs text-[#00FF41]/40 font-mono">
              搜索缓存自动过期时间
            </p>
          </div>

          <div
            className="flex items-center justify-between rounded-lg border border-[#00FF41]/10 bg-[#001100]/50 p-4 transition-all hover:border-[#00FF41]/20"
          >
            <div className="space-y-0.5">
              <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">
                手动清除
              </Label>
              <p className="text-sm text-[#00FF41]/50 font-mono">
                清除所有搜索缓存
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearCache}
              className="bg-[#FF0040]/20 text-[#FF0040] border border-[#FF0040]/30 hover:bg-[#FF0040]/30 font-mono text-xs uppercase tracking-wider"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              CLEAR
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm text-[#00FF41]/80 font-mono uppercase tracking-wider">
              缓存列表
            </Label>
            <div
              className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-lg border border-[#00FF41]/10 bg-[#001100]/50 p-3"
            >
              {Object.keys(searchResultsCache).length === 0 ? (
                <p className="py-4 text-center text-sm text-[#00FF41]/40 font-mono uppercase tracking-wider">
                  {'>'} 暂无缓存
                </p>
              ) : (
                Object.entries(searchResultsCache).map(([query, cache]) => (
                  <div
                    key={query}
                    className="flex items-center justify-between rounded bg-[#001100]/80 px-3 py-2.5 border border-[#00FF41]/10"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-[#00FF41] font-mono">{query}</span>
                      <span className="text-xs text-[#00FF41]/40 font-mono">
                        {new Date(cache.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#FF0040]/70 hover:bg-[#FF0040]/10 hover:text-[#FF0040]"
                      onClick={() => removeSearchResultsCacheItem(query)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
