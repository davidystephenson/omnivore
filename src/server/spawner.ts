import { Vec2, Body, Circle } from 'planck'
import { Spawnpoint } from './spawnpoint'
import { Stage } from './stage/stage'
import { RED, GREEN, Rgb, WHITE, YELLOW } from '../shared/color'
import { Obituary, Organism } from './actor/organism'
import { SIGHT } from '../shared/sight'
import { range } from './math'
import { Prop } from './feature/prop'
import { Debris } from './actor/debris'
import { Curtain } from './curtain'

export class Spawner {
  body: Body
  curtains: Curtain[] = []
  queue: Obituary[] = []
  stage: Stage
  spawnpoints: Spawnpoint[] = []

  constructor (stage: Stage) {
    this.stage = stage
    this.body = this.stage.world.createBody({
      type: 'static',
      position: Vec2(0, 0)
    })
    this.body.setUserData(this)
  }

  debugSpawnpoints (props: {
    color: Rgb
  }): void {
    if (!this.stage.flags.spawnpoints) {
      return
    }
    this.spawnpoints.forEach(point => {
      const collided = point.collideCount > 0
      const color = collided ? props.color : GREEN
      point.debug({ color })
    })
  }

  getFarthest (props: {
    obituary: Obituary
    spawnpoints: Spawnpoint[]
  }): Spawnpoint {
    const distances = props.spawnpoints.map(spawnpoint => {
      const distance = Vec2.distance(props.obituary.position, spawnpoint.position)
      return { spawnpoint, distance }
    })
    const sorted = distances.sort((a, b) => a.distance - b.distance)
    const farthest = sorted[sorted.length - 1]
    return farthest.spawnpoint
  }

  onStep (): void {
    this.stage.runner.features.forEach(feature => {
      if (feature instanceof Prop && feature.actor instanceof Debris && feature.blockCount > 0) {
        feature.takeDamage({
          damage: 0.0001,
          debug: this.stage.flags.curtains
        })
        if (this.stage.flags.curtains) {
          this.stage.debugCircle({
            circle: new Circle(feature.position, 0.5),
            color: RED
          })
        }
      }
    })
    if (this.stage.flags.curtains) {
      this.curtains.forEach(curtain => {
        curtain.debug({ color: WHITE })
      })
    }

    const organisms: Organism[] = []
    const families = new Set<Rgb>()
    this.stage.actors.forEach(actor => {
      if (!(actor instanceof Organism)) {
        return
      }
      organisms.push(actor)
      families.add(actor.color)
    })
    const habitable = this.stage.killingQueue.length === 0 && this.stage.starvationQueue.length === 0
    const respawnable = habitable && this.queue.length > 0
    if (respawnable) {
      this.stage.flag({ f: 'spawn', vs: ['respawnQueue.length', this.queue.length] })
      this.stage.flag({ f: 'spawn', vs: ['spawnPoints.length', this.spawnpoints.length] })
      const clearSpawnPoints = this.stage.spawner.spawnpoints.filter(spawnPoint => spawnPoint.collideCount < 1)
      this.stage.flag({ f: 'spawn', vs: ['clearSpawnPoints.length', clearSpawnPoints.length] })

      if (clearSpawnPoints.length > 0) {
        const first = this.stage.spawner.queue.shift()
        if (first == null) {
          throw new Error('There is no first')
        }
        // TODO longest path away
        const spawnpoint = this.getFarthest({ obituary: first, spawnpoints: clearSpawnPoints })
        const gene = first.gene.mutate()
        this.stage.flag({ f: 'respawn', k: 'Respawned', v: [first.color.label, new Date().toISOString()], seconds: 0 })
        void new Organism({ ...first, gene, position: spawnpoint.position, stage: this.stage })
        this.debugSpawnpoints({ color: GREEN })
      } else {
        const first = this.queue[0]
        this.stage.flag({ f: 'respawn', k: 'No spawnpoints for', v: first.color.label })
        this.debugSpawnpoints({ color: YELLOW })
      }
    } else {
      this.debugSpawnpoints({ color: RED })
    }
  }

  setupSpawnPoints (): void {
    if (this.stage.flags.waypointSpawnpointsGame) {
      const waypointArray = Object.values(this.stage.navigation.waypoints)
      const xs = waypointArray.map(w => Math.round(w.position.x))
      const ys = waypointArray.map(w => Math.round(w.position.y))
      const minimumX = Math.min(...xs)
      const maximumX = Math.max(...xs)
      const minimumY = Math.min(...ys)
      const maximumY = Math.max(...ys)
      const width = maximumX - minimumX
      const height = maximumY - minimumY
      const xQuotient = Math.floor(width / SIGHT.width)
      const yQuotient = Math.floor(height / SIGHT.height)
      const xCount = Math.max(xQuotient, 1)
      const yCount = Math.max(yQuotient, 1)
      const xMargin = width / xCount
      const yMargin = height / yCount
      const xRange = range(0, xCount - 1)
      const yRange = range(0, yCount - 1)
      const halfXMargin = xMargin / 2
      const xBase = minimumX + halfXMargin
      const bottomSpawnpoints = xRange.map(index => {
        const xPosition = xBase + (index * xMargin)
        const position = new Vec2(xPosition, minimumY)
        return new Spawnpoint({ spawner: this, position })
      })
      const topSpawnpoints = xRange.map(x => {
        const xPosition = xBase + (x * xMargin)
        const position = new Vec2(xPosition, maximumY)
        return new Spawnpoint({ spawner: this, position })
      })
      const yBase = minimumY + (yMargin / 2)
      const leftSpawnpoints = yRange.map(y => {
        const yPosition = yBase + (y * yMargin)
        const position = new Vec2(minimumX, yPosition)
        return new Spawnpoint({ spawner: this, position })
      })
      const rightSpawnpoints = yRange.map(y => {
        const yPosition = yBase + (y * yMargin)
        const position = new Vec2(maximumX, yPosition)
        return new Spawnpoint({ spawner: this, position })
      })
      this.spawnpoints = [...bottomSpawnpoints, ...topSpawnpoints, ...leftSpawnpoints, ...rightSpawnpoints]
      this.stage.debug({ v: `Setup ${this.spawnpoints.length} spawnpoints` })
      const curtainHalfHeight = this.stage.halfHeight - SIGHT.halfHeight
      this.curtains = [
        new Curtain({
          spawner: this,
          position: Vec2(0, minimumY),
          size: Vec2(this.stage.halfWidth, SIGHT.halfHeight)
        }),
        new Curtain({
          spawner: this,
          position: Vec2(0, maximumY),
          size: Vec2(this.stage.halfWidth, SIGHT.halfHeight)
        }),
        new Curtain({
          spawner: this,
          position: Vec2(minimumX, 0),
          size: Vec2(SIGHT.halfWidth, curtainHalfHeight)
        }),
        new Curtain({
          spawner: this,
          position: Vec2(maximumX, 0),
          size: Vec2(SIGHT.halfWidth, curtainHalfHeight)
        })
      ]
    } else {
      this.spawnpoints = [
        new Spawnpoint({ spawner: this, position: Vec2(5, 5) }),
        new Spawnpoint({ spawner: this, position: Vec2(15, 15) })
      ]
    }
  }
}
