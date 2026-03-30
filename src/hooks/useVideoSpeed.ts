import { useState, useEffect, useRef } from 'react'
import { apiService } from '@/services/api.service'
import { useApiStore } from '@/store/apiStore'
import type { SpeedResult } from '@/types'

// 速度等级阈值 (ms)
const SPEED_THRESHOLDS = {
  fast: 500, // < 500ms 为快
  medium: 1500, // < 1500ms 为中等
  // >= 1500ms 为慢
}

interface UseVideoSpeedResult {
  speed: SpeedResult | null
  loading: boolean
  error: boolean
}

interface SpeedCache {
  [key: string]: SpeedResult
}

// 全局缓存（LRU 限制）
const MAX_CACHE_SIZE = 50
const speedCache: SpeedCache = {}
const cacheOrder: string[] = []

// 正在进行的测速请求
const pendingRequests: Set<string> = new Set()

const getCacheKey = (sourceCode: string, vodId: string) => `${sourceCode}_${vodId}`

// LRU 缓存管理
const setCache = (key: string, value: SpeedResult) => {
  if (cacheOrder.includes(key)) {
    // 已存在，移到末尾
    cacheOrder.push(cacheOrder.splice(cacheOrder.indexOf(key), 1)[0])
  } else {
    // 新增
    if (cacheOrder.length >= MAX_CACHE_SIZE) {
      // 淘汰最老的
      const oldest = cacheOrder.shift()
      if (oldest) delete speedCache[oldest]
    }
    cacheOrder.push(key)
  }
  speedCache[key] = value
}

const calculateSpeedLevel = (speed: number): 'fast' | 'medium' | 'slow' => {
  if (speed < SPEED_THRESHOLDS.fast) return 'fast'
  if (speed < SPEED_THRESHOLDS.medium) return 'medium'
  return 'slow'
}

const measureSpeed = async (url: string): Promise<number> => {
  const startTime = performance.now()
  try {
    // 使用 HEAD 请求，只获取响应头
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
    })
    const endTime = performance.now()
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return endTime - startTime
  } catch {
    // 如果 HEAD 请求失败，尝试 GET 请求（部分服务器不支持 HEAD）
    const retryStartTime = performance.now()
    await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
    })
    const retryEndTime = performance.now()
    return retryEndTime - retryStartTime
  }
}

export const useVideoSpeed = (
  sourceCode: string,
  vodId: string,
  enabled: boolean = false,
): UseVideoSpeedResult => {
  const [speed, setSpeed] = useState<SpeedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const hasFetchedRef = useRef(false)

  // 使用 ref 存储 videoAPIs，避免依赖变化
  const videoAPIsRef = useRef(useApiStore.getState().videoAPIs)

  // 更新 ref
  useEffect(() => {
    videoAPIsRef.current = useApiStore.getState().videoAPIs
  })

  useEffect(() => {
    if (!enabled || hasFetchedRef.current) return
    hasFetchedRef.current = true

    const cacheKey = getCacheKey(sourceCode, vodId)

    // 检查缓存
    if (speedCache[cacheKey]) {
      setSpeed(speedCache[cacheKey])
      return
    }

    // 检查是否有正在进行的请求
    if (pendingRequests.has(cacheKey)) {
      return
    }

    // 找到对应的 API
    const api = videoAPIsRef.current.find(a => a.id === sourceCode)
    if (!api) {
      setError(true)
      return
    }

    setLoading(true)
    setError(false)
    pendingRequests.add(cacheKey)

    // 获取视频详情
    apiService
      .getVideoDetail(vodId, api)
      .then(detail => {
        if (detail.code !== 200 || !detail.episodes || detail.episodes.length === 0) {
          setError(true)
          setLoading(false)
          pendingRequests.delete(cacheKey)
          return
        }

        // 提取播放地址
        const playUrl = detail.episodes[0]
        if (!playUrl) {
          setError(true)
          setLoading(false)
          pendingRequests.delete(cacheKey)
          return
        }

        // 测量速度
        return measureSpeed(playUrl).then(speedMs => {
          const result: SpeedResult = {
            speed: Math.round(speedMs),
            level: calculateSpeedLevel(speedMs),
            timestamp: Date.now(),
          }

          // 缓存结果（LRU）
          setCache(cacheKey, result)
          pendingRequests.delete(cacheKey)
          setSpeed(result)
          setLoading(false)
        })
      })
      .catch(() => {
        setError(true)
        setLoading(false)
        pendingRequests.delete(cacheKey)
      })
  }, [enabled, sourceCode, vodId])

  return {
    speed,
    loading,
    error,
  }
}
