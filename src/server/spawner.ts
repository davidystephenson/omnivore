import { Vec2, Body, Circle } from 'planck'
import { Spawnpoint } from './spawnpoint'
import { Stage } from './stage/stage'
import { RED, GREEN, Rgb, WHITE, YELLOW } from '../shared/color'
import { Obituary } from './actor/organism'
import { SIGHT } from '../shared/sight'
import { range } from './math'
import { Prop } from './feature/prop'
import { Debris } from './actor/debris'
import { Curtain } from './curtain'

export class Spawner {
  body: Body
  curtains: Curtain[] = []
  message?: string
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
      if (
        feature instanceof Prop &&
        feature.actor instanceof Debris &&
        feature.blockCount > 0
      ) {
        feature.takeDamage({
          damage: 0.0002,
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
    const habitable = this.stage.killingQueue.length === 0 && this.stage.starvationQueue.length === 0
    if (this.stage.flags.respawn) {
      this.stage.flag({ f: 'spawn', vs: ['respawnQueue.length', this.queue.length] })
    }
    if (habitable && this.queue.length > 0) {
      this.stage.flag({ f: 'spawn', vs: ['respawnQueue.length', this.queue.length] })
      this.stage.flag({ f: 'spawn', vs: ['spawnPoints.length', this.spawnpoints.length] })
      const clearSpawnPoints = this.stage.spawner.spawnpoints.filter(
        spawnPoint => spawnPoint.collideCount < 1
      )
      this.stage.flag({ f: 'spawn', vs: ['clearSpawnPoints.length', clearSpawnPoints.length] })

      if (clearSpawnPoints.length > 0) {
        const first = this.stage.spawner.queue.shift()
        if (first == null) {
          throw new Error('There is no first')
        }
        // TODO longest path away
        const spawnpoint = this.getFarthest({ obituary: first, spawnpoints: clearSpawnPoints })
        const gene = first.gene.mutate()
        this.stage.flag({
          f: 'respawn',
          k: 'Respawned',
          v: [first.family.color.label, new Date().toISOString()],
          seconds: 0
        })
        first.family.addMember({
          gene,
          player: first.player,
          position: spawnpoint.position
        })
        this.debugSpawnpoints({ color: GREEN })
      } else {
        const first = this.queue[0]
        this.stage.flag({ f: 'respawn', k: 'No spawnpoints for', v: first.family.color.label })
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
        return new Spawnpoint({ stage: this.stage, position, vertical: false })
      })
      const topSpawnpoints = xRange.map(x => {
        const xPosition = xBase + (x * xMargin)
        const position = new Vec2(xPosition, maximumY)
        return new Spawnpoint({ stage: this.stage, position, vertical: false })
      })
      const yBase = minimumY + (yMargin / 2)
      const leftSpawnpoints = yRange.map(y => {
        const yPosition = yBase + (y * yMargin)
        const position = new Vec2(minimumX, yPosition)
        return new Spawnpoint({ stage: this.stage, position, vertical: true })
      })
      const rightSpawnpoints = yRange.map(y => {
        const yPosition = yBase + (y * yMargin)
        const position = new Vec2(maximumX, yPosition)
        return new Spawnpoint({ stage: this.stage, position, vertical: true })
      })
      this.spawnpoints = [...bottomSpawnpoints, ...topSpawnpoints, ...leftSpawnpoints, ...rightSpawnpoints]
      this.stage.debug({ v: `Setup ${this.spawnpoints.length} spawnpoints` })
      this.curtains = [
        new Curtain({
          spawner: this,
          position: Vec2(0, minimumY),
          size: Vec2(this.stage.halfWidth, this.stage.navigation.margin)
        }),
        new Curtain({
          spawner: this,
          position: Vec2(0, maximumY),
          size: Vec2(this.stage.halfWidth, this.stage.navigation.margin)
        }),
        new Curtain({
          spawner: this,
          position: Vec2(minimumX, 0),
          size: Vec2(this.stage.navigation.margin, this.stage.halfHeight)
        }),
        new Curtain({
          spawner: this,
          position: Vec2(maximumX, 0),
          size: Vec2(this.stage.navigation.margin, this.stage.halfHeight)
        })
      ]
    } else {
      this.spawnpoints = [
        new Spawnpoint({
          stage: this.stage,
          position: Vec2(5, 5),
          vertical: false
        }),
        new Spawnpoint({
          stage: this.stage,
          position: Vec2(15, 15),
          vertical: false
        })
      ]
    }
  }
}
