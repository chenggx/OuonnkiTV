import { useEffect } from 'react'
import { Card, CardFooter, CardHeader, Chip, Image, Spinner, Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { useDoubanRecommend, type DoubanSubject } from '@/hooks/useDoubanRecommend'
import { useSearch } from '@/hooks'

interface DoubanRecommendProps {
  active: boolean
}

export default function DoubanRecommend({ active }: DoubanRecommendProps) {
  const { searchMovie } = useSearch()
  const {
    tags,
    currentTag,
    currentType,
    subjects,
    loading,
    error,
    switchType,
    switchTag,
    init,
  } = useDoubanRecommend()

  // 组件激活时初始化
  useEffect(() => {
    if (active && subjects.length === 0) {
      init()
    }
  }, [active, init, subjects.length])

  // 处理卡片点击 - 跳转到搜索结果页
  const handleCardClick = (subject: DoubanSubject) => {
    // 使用标题搜索
    searchMovie(subject.title)
  }

  // 豆瓣卡片组件
  const DoubanCard = ({ subject, index }: { subject: DoubanSubject; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        isPressable
        isFooterBlurred
        onPress={() => handleCardClick(subject)}
        className="flex h-[27vh] w-full cursor-pointer items-center border-none transition-transform hover:scale-103 lg:h-[35vh]"
        radius="lg"
      >
        <CardHeader className="absolute top-1 z-10 flex-col items-start p-3">
          <div className="rounded-large bg-black/20 px-2 py-1 backdrop-blur">
            <p className="text-tiny font-bold text-white/80 uppercase">
              {subject.type === 'movie' ? '电影' : '电视剧'}
            </p>
          </div>
          {subject.rate && (
            <Chip
              size="sm"
              color="warning"
              variant="flat"
              className="bg-warning/80 mt-2 backdrop-blur"
            >
              {subject.rate}
            </Chip>
          )}
        </CardHeader>
        <Image
          removeWrapper
          isZoomed
          isBlurred={loading}
          loading="lazy"
          alt={subject.title}
          className="z-0 h-full w-full object-cover"
          src={subject.cover || 'https://placehold.jp/30/ffffff/000000/300x450.png?text=暂无封面'}
        />
        <CardFooter className="rounded-large shadow-small absolute bottom-[3%] z-10 min-h-[8vh] w-[92%] justify-between overflow-hidden border-1 border-white/20 py-2 backdrop-blur before:rounded-xl before:bg-white/10">
          <div className="flex flex-grow flex-col gap-1 px-1">
            <p className="line-clamp-2 text-sm font-semibold text-white">{subject.title}</p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )

  // 加载骨架屏
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 gap-[4vw] sm:grid-cols-3 md:gap-[2vw] xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card
          key={index}
          isPressable
          isFooterBlurred
          className="flex h-[27vh] w-full items-center border-none lg:h-[35vh]"
          radius="lg"
        >
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-default-100">
            <Spinner size="lg" color="primary" />
          </div>
          <CardFooter className="rounded-large shadow-small absolute bottom-[3%] z-10 min-h-[8vh] w-[92%] justify-between overflow-hidden border-1 border-white/20 py-2 backdrop-blur before:rounded-xl before:bg-white/10">
            <div className="flex flex-grow flex-col gap-1 px-1">
              <div className="h-4 w-3/4 rounded bg-default-200" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  if (!active) return null

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 py-8">
      {/* 类型切换 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onPress={() => switchType('movie')}
          color={currentType === 'movie' ? 'primary' : 'default'}
          variant={currentType === 'movie' ? 'solid' : 'flat'}
          className="cursor-pointer"
        >
          电影
        </Button>
        <Button
          size="sm"
          onPress={() => switchType('tv')}
          color={currentType === 'tv' ? 'primary' : 'default'}
          variant={currentType === 'tv' ? 'solid' : 'flat'}
          className="cursor-pointer"
        >
          电视剧
        </Button>
      </div>

      {/* 标签切换 */}
      <div className="flex flex-wrap justify-center gap-2">
        {tags.slice(0, 10).map(tag => (
          <Button
            key={tag}
            size="sm"
            onPress={() => switchTag(tag)}
            color={currentTag === tag ? 'secondary' : 'default'}
            variant={currentTag === tag ? 'solid' : 'flat'}
            className="cursor-pointer"
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex flex-col items-center gap-2 text-red-500">
          <p>{error}</p>
          <Button
            size="sm"
            onPress={() => init()}
            color="warning"
            variant="flat"
          >
            重试
          </Button>
        </div>
      )}

      {/* 推荐内容网格 */}
      {loading ? (
        <LoadingSkeleton />
      ) : subjects.length > 0 ? (
        <div className="flex flex-col items-center gap-10">
          <div className="grid grid-cols-2 gap-[4vw] sm:grid-cols-3 md:gap-[2vw] xl:grid-cols-4">
            {subjects.map((subject, index) => (
              <DoubanCard key={`${subject.url}_${index}`} subject={subject} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20 text-default-400">
          <p>暂无推荐内容</p>
        </div>
      )}
    </div>
  )
}
