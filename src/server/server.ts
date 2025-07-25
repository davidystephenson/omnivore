import { Controls } from '../shared/input'
import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs-extra'
import path from 'path'
import * as SocketIo from 'socket.io'
import { Config } from './config'
import { Stage } from './stage/stage'

export class Server {
  seed = Math.random().toString()
  config = new Config()
  dirname = path.dirname(__filename)
  app = express()
  httpServer: https.Server | http.Server
  io: SocketIo.Server
  stage: Stage
  step = 0

  constructor (props: {
    stage: Stage
  }) {
    this.setupApp()
    this.httpServer = this.getHttpServer()
    this.io = new SocketIo.Server(this.httpServer)
    this.stage = props.stage
    void this.start()
  }

  async start (): Promise<void> {
    this.httpServer.listen(this.config.port, () => {
      console.info(`listening on port: ${this.config.port}`)
    })
    this.io.on('connection', socket => {
      this.stage.debug({ vs: ['connection:', socket.id] })
      socket.emit('connected')
      const player = this.stage.addPlayer({ id: socket.id })
      if (player.organism == null) {
        throw new Error('player.organism is undefined')
      }
      socket.on('controls', (controls: Controls) => {
        if (controls.select) {
          this.stage.runner.paused = true
        }
        if (controls.cancel) {
          this.stage.runner.paused = false
        }
        if (player.organism != null) {
          player.organism.controls = controls
          if (this.stage.flags.playerControl) {
            player.organism.debugControls()
          }
        }
        const summary = this.stage.runner.getSummary({ player })
        socket.emit('serverUpdateClient', summary)
      })
      socket.on('disconnect', () => {
        this.stage.debug({ vs: ['disconnect:', socket.id] })
        player.destroy()
      })
    })
  }

  setupApp (): void {
    const staticPath = path.join(this.dirname, '..', '..', 'dist')
    const staticMiddleware = express.static(staticPath)
    this.app.use(staticMiddleware)
  }

  getHttpServer (): https.Server | http.Server {
    if (this.config.secure) {
      const keyPath = path.join(this.dirname, '../../sis-key.pem')
      const certPath = path.join(this.dirname, '../../sis-cert.pem')
      const key = fs.readFileSync(keyPath)
      const cert = fs.readFileSync(certPath)
      const credentials = { key, cert }
      return new https.Server(credentials, this.app)
    } else {
      return new http.Server(this.app)
    }
  }
}
