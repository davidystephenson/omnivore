import { Vec2 } from 'planck'
import { Controls } from '../shared/input'
import { GREEN } from '../shared/color'
import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs-extra'
import path from 'path'
import * as SocketIo from 'socket.io'
import { Config } from './config'
import { Playhouse } from './stage/playhouse'
// import { Funhouse } from './funhouse'
// import { GrandRehearsal } from './stage/grandRehearsal'
import { Rehearsal } from './stage/rehearsal'
import { Mission } from './stage/mission'
// import { Mission } from './stage/mission'

export class Server {
  seed = Math.random().toString()
  config = new Config()
  dirname = path.dirname(__filename)
  app = express()
  httpServer: https.Server | http.Server
  io: SocketIoServer
  playhouse: Playhouse
  step = 0

  constructor (props?: {
    playhouse?: Playhouse
  }) {
    this.setupApp()
    this.httpServer = this.getHttpServer()
    this.io = new SocketIo.Server(this.httpServer)
    this.playhouse = props?.playhouse ?? new Mission()
    void this.start()
  }

  async start (): Promise<void> {
    this.httpServer.listen(this.config.port, () => {
      console.info(`listening on port: ${this.config.port}`)
    })
    this.io.on('connection', socket => {
      this.playhouse.debug({ vs: ['connection:', socket.id] })
      socket.emit('connected')
      const player = this.playhouse.addPlayer({
        color: GREEN,
        id: socket.id,
        gene: this.playhouse.playerGene,
        position: Vec2(0, 0)
      })
      if (player.organism == null) {
        throw new Error('player.organism is undefined')
      }
      // player.organism.membrane.hungerDamage = 0.5
      // player.organism.membrane.combatDamage = 0.9
      socket.on('controls', (controls: Controls) => {
        if (player.organism != null) {
          player.organism.controls = controls
          if (controls.select) {
            this.playhouse.runner.paused = true
          }
          if (controls.cancel) {
            this.playhouse.runner.paused = false
            // player.organism.membrane.combatDamage = 0
            // player.organism.membrane.hungerDamage = 0
          }
        }
        const summary = this.playhouse.runner.getSummary({ player })
        socket.emit('serverUpdateClient', summary)
      })
      socket.on('disconnect', () => {
        this.playhouse.debug({ vs: ['disconnect:', socket.id] })
        player.organism?.destroy()
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

type SocketIoServer = SocketIo.Server
