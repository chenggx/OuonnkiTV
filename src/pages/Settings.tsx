import SideBar from '@/components/settings/layouts/SideBar'
import ModuleContent from '@/components/settings/layouts/ModuleContent'
import { useState } from 'react'
import { type SettingModuleList } from '@/types'
import { ListVideo, Info, ArrowLeft, Menu, Globe, Search, Play } from 'lucide-react'
import VideoSource from '@/components/settings/VideoSource'
import NetworkSettings from '@/components/settings/NetworkSettings'
import SearchSettings from '@/components/settings/SearchSettings'
import PlaybackSettings from '@/components/settings/PlaybackSettings'
import { cn } from '@/utils'
import AboutProject from '@/components/settings/AboutProject'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { PageBackground } from '@/components/ui/PageBackground'

export default function SettingsPage() {
  const navigate = useNavigate()
  const SideBarModules: SettingModuleList = [
    {
      id: 'video_source',
      name: '视频源',
      icon: <ListVideo size={20} />,
      component: <VideoSource />,
    },
    {
      id: 'network_settings',
      name: '网络',
      icon: <Globe size={20} />,
      component: <NetworkSettings />,
    },
    {
      id: 'search_settings',
      name: '搜索',
      icon: <Search size={20} />,
      component: <SearchSettings />,
    },
    {
      id: 'playback_settings',
      name: '播放',
      icon: <Play size={20} />,
      component: <PlaybackSettings />,
    },
    {
      id: 'about_project',
      name: '关于',
      icon: <Info size={20} />,
      component: <AboutProject />,
    },
  ]
  const [activeId, setActiveId] = useState(SideBarModules[0].id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const currentModule = SideBarModules.find(module => module.id === activeId) || SideBarModules[0]

  return (
    <div className="relative min-h-screen">
      <PageBackground />

      <div className="relative z-10 p-4 pb-20 md:p-6">
        {/* Top navigation bar */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="border border-[#00FF41]/30 bg-[#001100]/50 text-[#00FF41]/70 hover:bg-[#00FF41]/10 hover:text-[#00FF41] hover:border-[#00FF41]/50 font-mono text-xs uppercase tracking-wider"
          >
            <ArrowLeft size={16} className="mr-2" />
            返回
          </Button>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              className="border border-[#00FF41]/30 bg-[#001100]/50 text-[#00FF41]/70 hover:bg-[#00FF41]/10 hover:text-[#00FF41] hover:border-[#00FF41]/50 font-mono text-xs uppercase tracking-wider"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={16} className="mr-2" />
              <span className="text-sm font-medium">{currentModule.name}</span>
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar */}
          <div
            className={cn(
              'transition-all duration-300 md:block md:min-h-[70vh] md:w-64 md:opacity-100',
              isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-none',
            )}
          >
            <div
              className="rounded border border-[#00FF41]/20 bg-[#0D0D0D]/95 p-4 backdrop-blur-xl"
              style={{
                boxShadow: '0 0 30px rgba(0, 255, 65, 0.05), inset 0 0 30px rgba(0, 255, 65, 0.02)',
              }}
            >
              <SideBar
                className="w-full"
                activeId={activeId}
                modules={SideBarModules}
                onSelect={id => {
                  setActiveId(id)
                  setIsSidebarOpen(false)
                }}
              />
            </div>
          </div>

          {/* Content area */}
          <div
            className="flex-1 rounded border border-[#00FF41]/20 bg-[#0D0D0D]/95 p-6 backdrop-blur-xl"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.05), inset 0 0 30px rgba(0, 255, 65, 0.02)',
            }}
          >
            <ModuleContent module={currentModule} />
          </div>
        </div>
      </div>
    </div>
  )
}
