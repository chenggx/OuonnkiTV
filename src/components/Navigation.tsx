import { Navbar, NavbarBrand, NavbarContent } from '@heroui/react'
import { OkiLogo, SearchIcon } from '@/components/icons'
import { NavLink } from 'react-router'
import { useSearch } from '@/hooks'
import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import RecentHistory from '@/components/RecentHistory'

import { useSearchStore } from '@/store/searchStore'
import { useSettingStore } from '@/store/settingStore'
import { TrashIcon } from '@/components/icons'
import { Card } from '@heroui/react'

// Matrix-style Logo Component
function MatrixLogo() {
  return (
    <div className="flex items-center gap-3 group">
      <motion.div
        layoutId="app-logo"
        className="flex items-end gap-2"
      >
        <motion.div
          layoutId="logo-icon"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <OkiLogo size={36} />
        </motion.div>
        <motion.p
          layoutId="logo-text"
          className="hidden text-lg font-bold tracking-[0.3em] text-[#00FF41] md:block font-['Orbitron'] uppercase"
          style={{
            textShadow: '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3)',
          }}
        >
          OUONNKI
        </motion.p>
      </motion.div>
    </div>
  )
}

// Terminal-style Search Input
function TerminalSearchInput({
  onFocus,
  inputRef
}: {
  onFocus: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const { search: searchQuery, searchMovie } = useSearch()
  const [inputContent, setInputContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 200)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      searchMovie(inputContent)
    }
  }

  useEffect(() => {
    setInputContent(searchQuery)
  }, [searchQuery])

  return (
    <div className="relative w-full max-w-xl">
      {/* Terminal-style container */}
      <div
        className={`
          relative flex items-center
          bg-[#001100] border rounded
          transition-all duration-300
          ${isFocused
            ? 'border-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.3),inset_0_0_20px_rgba(0,255,65,0.05)]'
            : 'border-[#003300] hover:border-[#00FF41]/50'
          }
        `}
      >
        {/* Terminal prompt */}
        <div className="pl-4 pr-2 text-[#00FF41]/60 font-mono text-sm">
          <span className="select-none">{'>'}</span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          placeholder="SEARCH_MOVIES..."
          value={inputContent}
          onChange={e => setInputContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true)
            onFocus()
          }}
          onBlur={handleBlur}
          className="
            flex-1 h-12 pl-0 pr-4
            bg-transparent border-0
            text-[#00FF41] placeholder:text-[#00FF41]/30
            focus:outline-none focus:ring-0
            font-mono text-sm tracking-wider
          "
        />

        {/* Search icon */}
        <div className="pr-4">
          <SearchIcon size={18} />
        </div>

        {/* Animated border effect on focus */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 animate-border-flow opacity-30" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function Navigation() {
  const { searchMovie } = useSearch()
  const { searchHistory, removeSearchHistoryItem, clearSearchHistory } = useSearchStore()
  const { search: searchSettings } = useSettingStore()
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFocus = () => {
    setIsFocused(true)
  }

  return (
    <motion.div
      className="sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'tween',
        duration: 0.5,
        ease: 'easeOut',
      }}
    >
      {/* Background blur bar */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF41]/50 to-transparent" />

      {/* History button - fixed to top right */}
      <motion.div
        layoutId="history-icon"
        className="absolute top-4 right-4 z-50 flex items-center justify-center p-3 rounded transition-all duration-200 hover:bg-[#00FF41]/10 border border-transparent hover:border-[#00FF41]/30 cursor-pointer"
      >
        <RecentHistory />
      </motion.div>

      <Navbar
        classNames={{
          wrapper: 'max-w-7xl px-6',
        }}
        className="relative bg-transparent"
      >
        <NavbarBrand className="!flex-none">
          <NavLink to="/" className="flex items-center gap-3 group">
            <MatrixLogo />
          </NavLink>
        </NavbarBrand>

        <NavbarContent as="div" className="items-center justify-end gap-4">
          <motion.div layoutId="search-container" className="flex w-full max-w-xl">
            <TerminalSearchInput onFocus={handleFocus} inputRef={inputRef} />

            {isFocused && searchSettings.isSearchHistoryVisible && searchHistory.length > 0 && (
              <div className="absolute top-14 left-0 w-full px-2 z-50">
                <Card
                  className="w-full bg-[#0D0D0D]/95 backdrop-blur-xl border border-[#00FF41]/20 shadow-[0_0_30px_rgba(0,255,65,0.1)]"
                  style={{
                    boxShadow: '0 0 30px rgba(0, 255, 65, 0.1), inset 0 0 30px rgba(0, 255, 65, 0.02)',
                  }}
                >
                  {/* Header */}
                  <div className="mb-2 flex items-center justify-between px-4 py-3 border-b border-[#00FF41]/10">
                    <span className="text-sm font-mono text-[#00FF41]/60 uppercase tracking-wider">
                      {'>'} 搜索历史
                    </span>
                    <span
                      className="cursor-pointer font-mono text-xs text-[#FF0040]/60 hover:text-[#FF0040] transition-colors tracking-wider"
                      onClick={clearSearchHistory}
                    >
                      [清空]
                    </span>
                  </div>

                  {/* History items */}
                  <div className="max-h-60 overflow-y-auto">
                    {searchHistory.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex cursor-pointer items-center justify-between rounded p-3 mx-2 mb-1
                          hover:bg-[#00FF41]/5 border border-transparent hover:border-[#00FF41]/20
                          transition-all duration-200 group"
                        onClick={() => {
                          if (inputRef.current) {
                            inputRef.current.value = item.content
                          }
                          searchMovie(item.content)
                          setIsFocused(false)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[#00FF41]/30 font-mono text-xs">›</span>
                          <span className="line-clamp-1 text-sm text-[#00FF41]/90 font-mono">
                            {item.content}
                          </span>
                        </div>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[#FF0040]/10 transition-all"
                          onClick={e => {
                            e.stopPropagation()
                            removeSearchHistoryItem(item.id)
                          }}
                        >
                          <TrashIcon size={14} className="text-[#FF0040]/60" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 border-t border-[#00FF41]/10">
                    <span className="text-[10px] font-mono text-[#00FF41]/30 tracking-wider">
                      共 {searchHistory.length} 条记录
                    </span>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </NavbarContent>
      </Navbar>
    </motion.div>
  )
}
