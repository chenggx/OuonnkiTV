// 判断是否为图片请求
const isImageRequest = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) ||
    url.includes('doubanio.com')
}

// 统一的代理处理逻辑
export async function handleProxyRequest(targetUrl: string): Promise<Response> {
  // 验证 URL
  try {
    new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  const isImage = isImageRequest(targetUrl)

  // 构建请求头
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  }

  // 图片请求需要正确的 Accept
  if (isImage) {
    headers['Accept'] = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
  } else {
    headers['Accept'] = 'application/json, text/plain, */*'
  }

  // 豆瓣图片需要 Referer
  if (targetUrl.includes('douban')) {
    headers['Referer'] = 'https://movie.douban.com/'
  }

  // 发起请求
  const response = await fetch(targetUrl, {
    headers,
    signal: AbortSignal.timeout(15000), // 15秒超时
  })

  // 图片请求需要透传响应头（特别是 Content-Type）
  if (isImage) {
    const contentType = response.headers.get('Content-Type')
    const contentLength = response.headers.get('Content-Length')

    // 直接返回原始响应，保留所有响应头
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Content-Length': contentLength || '',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=86400', // 缓存1天
      },
    })
  }

  return response
}

// 从查询参数获取目标 URL
export function getTargetUrl(url: string): string {
  const urlObj = new URL(url, 'http://localhost')
  const targetUrl = urlObj.searchParams.get('url')

  if (!targetUrl) {
    throw new Error('URL parameter is required')
  }

  return decodeURIComponent(targetUrl)
}
