import { useState, useCallback } from 'react'

// 豆瓣推荐项类型
export interface DoubanSubject {
  title: string
  rate: string
  cover: string
  url: string
  type?: 'movie' | 'tv'
}

// API 基础地址
const DOUBAN_API_BASE = 'https://movie.douban.com/j'

// 获取代理 URL
const getProxyUrl = (targetUrl: string) => {
  return `/proxy?url=${encodeURIComponent(targetUrl)}`
}

// 豆瓣图片代理域名
const DOUBAN_IMG_DOMAINS = ['img1.doubanio.com', 'img2.doubanio.com', 'img3.doubanio.com']

// 判断是否为豆瓣图片
const isDoubanImage = (url: string) => {
  return DOUBAN_IMG_DOMAINS.some(domain => url.includes(domain))
}

// 代理豆瓣图片
const proxyImageUrl = (url: string) => {
  if (isDoubanImage(url)) {
    return getProxyUrl(url)
  }
  return url
}

export const useDoubanRecommend = () => {
  const [tags, setTags] = useState<string[]>(['热门', '最新', '经典', '华语', '欧美', '韩国', '日本'])
  const [currentTag, setCurrentTag] = useState('热门')
  const [currentType, setCurrentType] = useState<'movie' | 'tv'>('movie')
  const [subjects, setSubjects] = useState<DoubanSubject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取标签列表
  const fetchTags = useCallback(async (type: 'movie' | 'tv') => {
    try {
      const url = `${DOUBAN_API_BASE}/search_tags?type=${type}`
      const proxyUrl = getProxyUrl(url)

      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error('获取标签失败')

      const data = await response.json()
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags)
      }
    } catch (err) {
      console.error('获取豆瓣标签失败:', err)
      // 使用默认标签
      setTags(['热门', '最新', '经典', '华语', '欧美', '韩国', '日本'])
    }
  }, [])

  // 获取推荐列表
  const fetchRecommend = useCallback(async (
    tag: string,
    type: 'movie' | 'tv',
    pageLimit = 16,
    pageStart = 0
  ) => {
    setLoading(true)
    setError(null)

    try {
      const url = `${DOUBAN_API_BASE}/search_subjects?type=${type}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`
      const proxyUrl = getProxyUrl(url)

      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://movie.douban.com/',
          'Accept': 'application/json, text/plain, */*',
        },
      })

      if (!response.ok) throw new Error('获取推荐失败')

      const data = await response.json()

      if (data.subjects && Array.isArray(data.subjects)) {
        const formattedSubjects: DoubanSubject[] = data.subjects.map((item: Record<string, unknown>) => ({
          title: item.title as string,
          rate: item.rate as string,
          cover: proxyImageUrl(item.cover as string),
          url: item.url as string,
          type,
        }))
        setSubjects(formattedSubjects)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取推荐失败')
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 切换类型
  const switchType = useCallback(async (type: 'movie' | 'tv') => {
    if (type === currentType) return
    setCurrentType(type)
    await fetchTags(type)
    await fetchRecommend(currentTag, type)
  }, [currentType, currentTag, fetchTags, fetchRecommend])

  // 切换标签
  const switchTag = useCallback(async (tag: string) => {
    if (tag === currentTag) return
    setCurrentTag(tag)
    await fetchRecommend(tag, currentType)
  }, [currentTag, currentType, fetchRecommend])

  // 初始化加载
  const init = useCallback(async () => {
    await fetchTags(currentType)
    await fetchRecommend(currentTag, currentType)
  }, [fetchTags, fetchRecommend, currentTag, currentType])

  return {
    tags,
    currentTag,
    setCurrentTag,
    currentType,
    setCurrentType,
    subjects,
    loading,
    error,
    fetchRecommend,
    switchType,
    switchTag,
    init,
  }
}
