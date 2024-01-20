import express from 'express'
import path from 'path'
import http from 'http'
// import { ClientToServerEvents, ServerToClientEvents } from '../shared/socket'
const app = express()
const staticPath = path.join(__dirname, '..', '..', 'dist')
const staticMiddleware = express.static(staticPath)
app.use(staticMiddleware)
const server = new http.Server(app)
const PORT = process.env.PORT ?? 3000
console.info('PORT set as', PORT)
server.listen(PORT, () => {
  console.info(`Listening on :${PORT}`)
})