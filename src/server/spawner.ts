import { Vec2, Body, Circle } from 'planck'
import { Spawnpoint } from './spawnpoint'
import { Stage } from './stage/stage'
import { RED, GREEN, Rgb, YELLOW } from '../shared/color'
import { Obituary, Organism } from './actor/organism'
import { HALF_SIGHT_HEIGHT, SIGHT, SIGHT_WIDTH } from '../shared/sight'
import { range } from './math'
import { Prop } from './feature/prop'
import { Debris } from './actor/debris'

export class Spawner {
  static RATIO = 1
  static RADIUS = HALF_SIGHT_HEIGHT * Spawner.RATIO
  queue: Obituary[] = []
  stage: Stage
  spawnpoints: Spawnpoint[] = []
  body: Body

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
    this.spawnpoints.forEach(point => {
      const transparent = { ...props.color, alpha: 0.1 }
      this.stage.debugCircle({
        circle: new Circle(point.position, Spawner.RADIUS),
        color: transparent
      })
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
    if (this.stage.flags.spawnpoints) {
      this.spawnpoints.forEach(point => {
        const collided = point.collideCount > 0
        const color = collided ? RED : GREEN
        point.debug({ color })
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
    if (this.queue.length === 0) {
      return
    }
    const area = this.stage.halfHeight * this.stage.halfWidth * 4
    this.stage.flag({ f: 'spawn', k: 'area', v: area })
    const organismCap = area / 100
    this.stage.flag({ f: 'spawn', k: 'organismCap', v: organismCap })
    function sigmoid (x: number): number {
      return 1 / (1 + Math.exp(-x))
    }
    const sigmaArea = sigmoid(area / 1000)
    this.stage.flag({ f: 'spawn', k: 'sigmaArea', v: sigmaArea })
    // const familyCap = 8 - (3 * 1 / sigmaArea)
    const familyCap = 6
    this.stage.flag({ f: 'spawn', k: 'familyCap', v: familyCap })
    const organismsNeeded = organisms.length < organismCap
    const familiesNeeded = families.size < familyCap
    const needed = organismsNeeded || familiesNeeded
    const living = this.stage.killingQueue.length === 0 && this.stage.starvationQueue.length === 0
    const respawnable = living && this.queue.length > 0 && needed
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
      } else {
        this.stage.runner.features.forEach(feature => {
          if (feature instanceof Prop && feature.actor instanceof Debris && feature.blockCount > 0) {
            feature.takeDamage({
              damage: 0.01,
              debug: this.stage.flags.spawnpoints
            })
            if (this.stage.flags.spawnpoints) {
              this.stage.debugCircle({
                circle: new Circle(feature.position, 0.5),
                color: RED
              })
            }
          }
        })
        if (this.stage.flags.spawnpoints) {
          this.spawnpoints.forEach(point => {
            point.debug({ color: YELLOW })
          })
        }
        const first = this.queue[0]
        this.stage.flag({ f: 'respawn', k: 'No spawnpoints for', v: first.color.label })
      }
    }
  }

  setupSpawnPoints (): void {
    if (this.stage.flags.waypointSpawnpointsGame) {
      const waypointArray = Object.values(this.stage.navigation.waypoints)
      const xs = waypointArray.map(w => Math.round(w.position.x))
      const ys = waypointArray.map(w => Math.round(w.position.y))
      const minimumX = Math.min(...xs)
      console.log('minimumX', minimumX)
      const maximumX = Math.max(...xs)
      const minimumY = Math.min(...ys)
      console.log('minimumY', minimumY)
      const maximumY = Math.max(...ys)
      const width = maximumX - minimumX
      console.log('width', width)
      const height = maximumY - minimumY
      console.log('height', height)
      console.log('SIGHT.width', SIGHT.width)
      console.log('SIGHT.height', SIGHT.height)
      const xQuotient = Math.floor(width / SIGHT.width)
      console.log('xQuotient', xQuotient)
      const yQuotient = Math.floor(height / SIGHT.height)
      console.log('yQuotient', yQuotient)
      const xCount = Math.max(xQuotient, 1)
      console.log('xCount', xCount)
      const yCount = Math.max(yQuotient, 1)
      console.log('yCount', yCount)
      const xMargin = width / xCount
      console.log('xMargin', xMargin)
      const yMargin = height / yCount
      console.log('yMargin', yMargin)
      const xRange = range(0, xCount - 1)
      console.log('xRange', xRange)
      const yRange = range(0, yCount - 1)
      console.log('yRange', yRange)
      const halfXMargin = xMargin / 2
      console.log('halfXMargin', halfXMargin)
      const xBase = minimumX + halfXMargin
      console.log('xBase', xBase)
      const bottomSpawnpoints = xRange.map(index => {
        const xPosition = xBase + (index * xMargin)
        const position = new Vec2(xPosition, minimumY)
        return new Spawnpoint(this, position)
      })
      const topSpawnpoints = xRange.map(x => {
        const xPosition = xBase + (x * xMargin)
        const position = new Vec2(xPosition, maximumY)
        return new Spawnpoint(this, position)
      })
      const yBase = minimumY + (yMargin / 2)
      const leftSpawnpoints = yRange.map(y => {
        const yPosition = yBase + (y * yMargin)
        const position = new Vec2(minimumX, yPosition)
        return new Spawnpoint(this, position)
      })
      const rightSpawnpoints = yRange.map(y => {
        const yPosition = yBase + (y * yMargin)
        const position = new Vec2(maximumX, yPosition)
        return new Spawnpoint(this, position)
      })
      this.spawnpoints = [...bottomSpawnpoints, ...topSpawnpoints, ...leftSpawnpoints, ...rightSpawnpoints]
      // const edgeWaypoints = waypointArray.filter(waypoint => {
      //   const xEdge = Math.round(Math.abs(waypoint.position.x)) === maximumX || Math.round(Math.abs(waypoint.position.x)) === minimumX
      //   const yEdge = Math.round(Math.abs(waypoint.position.y)) === maximumY || Math.round(Math.abs(waypoint.position.y)) === minimumY
      //   return xEdge || yEdge
      // })
      // this.spawnpoints = edgeWaypoints.map(waypoint => {
      //   return new Spawnpoint(this, waypoint.position)
      // })
      this.stage.debug({ v: ['Setup', this.spawnpoints.length, 'spawnpoints'] })
    } else {
      this.spawnpoints = [
        new Spawnpoint(this, Vec2(5, 5)),
        new Spawnpoint(this, Vec2(15, 15))
      ]
    }
  }
}
