import type { Plugin } from 'vite'
import { handleProxyRequest, getTargetUrl } from '../utils/proxy'

export function proxyMiddleware(): Plugin {
  return {
    name: 'proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/proxy')) {
          return next()
        }

        try {
          const targetUrl = getTargetUrl(req.url)
          const response = await handleProxyRequest(targetUrl)

          // 图片使用 arrayBuffer，文本使用 text
          const contentType = response.headers.get('content-type') || 'application/json'
          const isImage = contentType.startsWith('image/')
          const data = isImage ? Buffer.from(await response.arrayBuffer()) : await response.text()

          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', contentType)
          res.writeHead(response.status)
          res.end(data)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Proxy request failed', message }))
        }
      })
    },
  }
}
