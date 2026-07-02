import { createServer } from 'node:http'
import { createReadStream, statSync, existsSync } from 'node:fs'
import { resolve, extname, join } from 'node:path'
import handler from './dist/server/server.js'

const PORT = parseInt(process.env.PORT || '3000')
const staticDir = resolve('./dist/client')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
}

async function requestToFetch(req) {
  const host = req.headers.host || 'localhost'
  const url = `http://${host}${req.url}`
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = chunks.length ? Buffer.concat(chunks) : undefined
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  })
}

async function pipeResponse(webRes, res) {
  const headers = {}
  webRes.headers.forEach((v, k) => { headers[k] = v })
  res.writeHead(webRes.status, headers)
  if (webRes.body) {
    const reader = webRes.body.getReader()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
  }
  res.end()
}

createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname

  if (pathname === '/runtime-config.js') {
    const body = `window.__RUNTIME_CONFIG__ = ${JSON.stringify({ VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || '' })};`
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' })
    res.end(body)
    return
  }

  const filePath = join(staticDir, pathname)

  if (existsSync(filePath)) {
    const stat = statSync(filePath)
    if (stat.isFile()) {
      const mime = MIME[extname(filePath)] || 'application/octet-stream'
      // Hashed asset paths (/assets/*) are immutably cached; others are not
      const maxAge = pathname.startsWith('/assets/') ? 31536000 : 0
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': stat.size,
        'Cache-Control': maxAge ? `public, max-age=${maxAge}, immutable` : 'no-cache',
      })
      createReadStream(filePath).pipe(res)
      return
    }
  }

  try {
    const request = await requestToFetch(req)
    const response = await handler.fetch(request)
    await pipeResponse(response, res)
  } catch (err) {
    console.error('[server] Error:', err)
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}).listen(PORT, () => {
  console.log(`Listening on :${PORT}`)
  console.log(`VITE_API_BASE_URL=${process.env.VITE_API_BASE_URL || '(not set, client falls back to build-time default)'}`)
})
