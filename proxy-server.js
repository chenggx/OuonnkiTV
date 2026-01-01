import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PROXY_PORT || 3001

// 判断是否为图片请求
const isImageRequest = (url) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) ||
    url.includes('doubanio.com')
}

// 统一的代理处理逻辑
async function handleProxyRequest(targetUrl) {
  try {
    new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  const isImage = isImageRequest(targetUrl)

  const headers = {
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
    signal: AbortSignal.timeout(15000),
  })

  return response
}

app.use(cors({ origin: '*' }))

app.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    const targetUrl = decodeURIComponent(url)
    const response = await handleProxyRequest(targetUrl)
    const contentType = response.headers.get('content-type') || 'application/json'
    const isImage = contentType.startsWith('image/')

    // 图片使用 arrayBuffer，文本使用 text
    const data = isImage ? Buffer.from(await response.arrayBuffer()) : await response.text()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.status(response.status).send(data)
  } catch (error) {
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    })
  }
})

app.listen(PORT, () => console.log(`Proxy server on :${PORT}`))
