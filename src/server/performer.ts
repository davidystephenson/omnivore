
import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs-extra'
import path from 'path'
import { Vec2 } from 'planck'
import { Controls } from '../shared/input'
import { GREEN } from '../shared/color'
import { Server } from './server'
import { Performance } from './stage/performance'
import { PerformanceConstructor, Promptbook } from './types'
import { Flags } from './flags'

export class Performer extends Server {
  performance: Performance

  constructor (props: {
    promptbook: Promptbook
    Performance: PerformanceConstructor
  }) {
    console.info('Playhouse half size:', props.promptbook.halfWidth, 'x', props.promptbook.halfHeight)
    const performance = new props.Performance({
      flags: new Flags({
        performance: false
      }),
      promptbook: props.promptbook
    })
    super({
      playhouse: performance
    })
    this.performance = performance
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
      socket.on('controls', (controls: Controls) => {
        if (player.organism != null) {
          player.organism.controls = controls
          if (this.playhouse.flags.playerControl) {
            player.organism.debugControls()
          }
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
