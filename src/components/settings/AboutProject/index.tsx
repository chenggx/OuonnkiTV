import { OkiLogo } from '@/components/icons'
import { Github, History } from 'lucide-react'
import { useVersionStore } from '@/store/versionStore'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useSettingStore } from '@/store/settingStore'
import ActionDropdown from '@/components/common/ActionDropdown'
import { usePersonalConfig } from '@/hooks/usePersonalConfig'
import { useRef, useState } from 'react'
import { URLConfigModal, TextConfigModal } from './ImportConfigModal'
import { ConfirmModal } from '@/components/common/ConfirmModal'

export default function AboutProject() {
  const currentYear = new Date().getFullYear()
  const { currentVersion, setShowUpdateModal } = useVersionStore()
  const { system, setSystemSettings } = useSettingStore()

  const { exportConfig, exportConfigToText, importConfig, restoreDefault } = usePersonalConfig()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    importConfig(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const [urlConfigModalOpen, setUrlConfigModalOpen] = useState(false)
  const [textConfigModalOpen, setTextConfigModalOpen] = useState(false)
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 py-6">
        <div
          className="transition-all duration-300 hover:scale-105"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(0, 255, 65, 0.3))',
          }}
        >
          <OkiLogo size={100} />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="text-2xl font-bold tracking-tight text-[#00FF41] md:text-3xl font-['Orbitron'] uppercase"
            style={{
              textShadow: '0 0 20px rgba(0, 255, 65, 0.5), 0 0 40px rgba(0, 255, 65, 0.3)',
            }}
          >
            OUONNKI TV
          </h1>
          <div className="flex items-center gap-2">
            <span
              className="rounded px-3 py-1 text-xs font-mono font-medium uppercase tracking-wider"
              style={{
                background: 'rgba(0, 255, 65, 0.15)',
                color: '#00FF41',
                border: '1px solid rgba(0, 255, 65, 0.3)',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
              }}
            >
              v{currentVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex flex-col gap-3">
        <div
          className="flex flex-row items-center justify-between rounded border border-[#00FF41]/20 bg-[#001100]/50 p-4 transition-all hover:bg-[#00FF41]/5 hover:border-[#00FF41]/30"
        >
          <div className="space-y-0.5">
            <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">更新日志</Label>
            <p className="text-sm text-[#00FF41]/50 font-mono">显示版本更新通知</p>
          </div>
          <Switch
            checked={system.isUpdateLogEnabled}
            onCheckedChange={checked => setSystemSettings({ isUpdateLogEnabled: checked })}
            className="[&>span:first-child]:data-[state=checked]:bg-[#00FF41] [&>span:first-child]:data-[state=checked]:shadow-[0_0_15px_rgba(0,255,65,0.5)] [&>span:last-child]:data-[state=checked]:bg-black"
          />
        </div>

        <div
          className="flex flex-row items-center justify-between rounded border border-[#00FF41]/20 bg-[#001100]/50 p-4 transition-all hover:bg-[#00FF41]/5 hover:border-[#00FF41]/30"
        >
          <div className="space-y-0.5">
            <Label className="text-base text-[#00FF41] font-mono uppercase tracking-wider">配置管理</Label>
            <p className="text-sm text-[#00FF41]/50 font-mono">导入导出设置</p>
          </div>
          <ActionDropdown
            label="操作"
            items={[
              {
                label: '导出配置',
                type: 'sub',
                children: [
                  {
                    label: '导出到文件',
                    onClick: exportConfig,
                  },
                  {
                    label: '导出到文本',
                    onClick: exportConfigToText,
                  },
                ],
              },
              {
                label: '导入配置',
                type: 'sub',
                children: [
                  {
                    label: '从文件导入',
                    onClick: () => fileInputRef.current?.click(),
                  },
                  {
                    label: '从URL导入',
                    onClick: () => setUrlConfigModalOpen(true),
                  },
                  {
                    label: '从文本导入',
                    onClick: () => setTextConfigModalOpen(true),
                  },
                ],
              },
              {
                label: '恢复默认',
                className: 'text-[#FF0040] focus:text-[#FF0040] focus:bg-[#FF0040]/10',
                onClick: () => setConfirmRestoreOpen(true),
              },
            ]}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <URLConfigModal open={urlConfigModalOpen} onOpenChange={setUrlConfigModalOpen} />
      <TextConfigModal open={textConfigModalOpen} onOpenChange={setTextConfigModalOpen} />
      <ConfirmModal
        isOpen={confirmRestoreOpen}
        onClose={() => setConfirmRestoreOpen(false)}
        onConfirm={restoreDefault}
        title="确认恢复？"
        description="这将重置所有设置和视频源到默认状态，此操作无法撤销。"
        confirmText="确认恢复"
        isDestructive={true}
      />

      {/* Description Section */}
      <div
        className="rounded border border-[#00FF41]/20 bg-[#001100]/50 p-6 text-center backdrop-blur-sm md:text-left"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.02)',
        }}
      >
        <h2 className="mb-3 text-base font-semibold text-[#00FF41]/80 font-mono uppercase tracking-wider">
          {'>>'} 关于项目
        </h2>
        <p className="leading-relaxed text-[#00FF41]/60 font-mono text-sm">
          OUONNKI TV 是一个现代化的视频聚合搜索平台，专为优化观影体验而设计。
        </p>
      </div>

      {/* Links Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a
          href="https://github.com/ouonnki/OuonnkiTV"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div
            className="flex items-center gap-4 rounded border border-[#00FF41]/20 bg-[#001100]/50 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-[#00FF41]/5 hover:border-[#00FF41]/40"
            style={{
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.05)',
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              style={{
                background: 'rgba(0, 255, 65, 0.1)',
                border: '1px solid rgba(0, 255, 65, 0.2)',
              }}
            >
              <Github
                className="h-6 w-6 text-[#00FF41]/70 group-hover:text-[#00FF41]"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(0, 255, 65, 0.3))',
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#00FF41] font-mono uppercase tracking-wider">GitHub</span>
              <span className="text-xs text-[#00FF41]/50 font-mono">查看源代码</span>
            </div>
          </div>
        </a>

        <div onClick={() => setShowUpdateModal(true)} className="group block cursor-pointer">
          <div
            className="flex items-center gap-4 rounded border border-[#00FF41]/20 bg-[#001100]/50 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-[#00FF41]/5 hover:border-[#00FF41]/40"
            style={{
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.05)',
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              style={{
                background: 'rgba(0, 255, 65, 0.1)',
                border: '1px solid rgba(0, 255, 65, 0.2)',
              }}
            >
              <History
                className="h-6 w-6 text-[#00FF41]"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(0, 255, 65, 0.5))',
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#00FF41] font-mono uppercase tracking-wider">更新日志</span>
              <span className="text-xs text-[#00FF41]/50 font-mono">版本历史</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div
        className="mt-4 flex flex-col items-center gap-2 border-t border-[#00FF41]/10 pt-6 text-center"
        style={{
          borderColor: 'rgba(0, 255, 65, 0.1)',
        }}
      >
        <p className="text-sm text-[#00FF41]/30 font-mono uppercase tracking-wider">© {currentYear} OUONNKI TV</p>
        <p className="text-xs text-[#00FF41]/20 font-mono">由 OUONNKI 团队用 ❤️ 打造</p>
      </div>
    </div>
  )
}
