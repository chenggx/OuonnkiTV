/**
 * EdgeOne Pages 代理函数
 * 访问路径: /api/proxy?url=<encoded_url>
 */

// 判断是否为图片请求
const isImageRequest = (url) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) ||
    url.includes('doubanio.com')
}

// 验证 URL 格式
const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default async function onRequest(context) {
  const { request, waitUntil } = context
  const urlObj = new URL(request.url)
  const targetUrl = urlObj.searchParams.get('url')

  // 验证 URL 参数
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const decodedUrl = decodeURIComponent(targetUrl)

  if (!isValidUrl(decodedUrl)) {
    return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const isImage = isImageRequest(decodedUrl)

  // 构建请求头
  const headers = new Headers()
  headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')

  if (isImage) {
    headers.set('Accept', 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8')
  } else {
    headers.set('Accept', 'application/json, text/plain, */*')
  }

  // 豆瓣相关请求添加 Referer
  if (decodedUrl.includes('douban')) {
    headers.set('Referer', 'https://movie.douban.com/')
  }

  try {
    const response = await fetch(decodedUrl, {
      headers,
      signal: AbortSignal.timeout(15000),
    })

    const responseHeaders = new Headers()
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type')

    if (isImage) {
      const contentType = response.headers.get('Content-Type') || 'image/jpeg'
      const contentLength = response.headers.get('Content-Length')

      responseHeaders.set('Content-Type', contentType)
      if (contentLength) {
        responseHeaders.set('Content-Length', contentLength)
      }
      responseHeaders.set('Cache-Control', 'max-age=86400')

      // 图片使用 ReadableStream
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    } else {
      responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/json')
      const text = await response.text()
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: 'Proxy request failed', message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
