import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
  
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      req.server = server
      await handle(req, res, parsedUrl)
    } catch (err) {
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  
  // Store server reference globally
  if (typeof process !== 'undefined') {
    process.server = server
  }

  // Import and initialize socket manager BEFORE listening
  const { socketManager } = await import('./lib/socket.js')
  const io = socketManager.initialize(server)
  
  // Attach io instance to server object for direct access
  if (io) {
    server.io = io
  }

  server.once('error', (err) => {
    process.exit(1)
  })

  server.listen(port, (err) => {
    if (err) {
      process.exit(1)
    }
  })
}).catch((error) => {
  process.exit(1)
})
