import type { VercelRequest, VercelResponse } from '@vercel/node'

// 判断是否为图片请求
const isImageRequest = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) ||
    url.includes('doubanio.com')
}

async function handleProxyRequest(targetUrl: string): Promise<Response> {
  try {
    new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  const isImage = isImageRequest(targetUrl)

  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  }

  if (isImage) {
    headers['Accept'] = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
  } else {
    headers['Accept'] = 'application/json, text/plain, */*'
  }

  if (targetUrl.includes('douban')) {
    headers['Referer'] = 'https://movie.douban.com/'
  }

  const response = await fetch(targetUrl, {
    headers,
  })

  return response
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    const targetUrl = decodeURIComponent(url)
    const response = await handleProxyRequest(targetUrl)
    const contentType = response.headers.get('content-type') || 'application/json'
    const isImage = contentType.startsWith('image/')

    // 图片使用 arrayBuffer，文本使用 text
    const data = isImage ? await response.arrayBuffer() : await response.text()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.status(response.status).send(Buffer.from(data))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: 'Proxy request failed', message })
  }
}
