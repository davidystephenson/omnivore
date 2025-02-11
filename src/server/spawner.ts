import { Vec2, Body, Circle } from 'planck'
import { Spawnpoint } from './spawnpoint'
import { Stage } from './stage/stage'
import { RED, GREEN, Rgb } from '../shared/color'
import { Obituary, Organism } from './actor/organism'

export class Spawner {
  queue: Obituary[] = []
  stage: Stage
  spawnPoints: Spawnpoint[] = []
  body: Body

  constructor (stage: Stage) {
    this.stage = stage
    this.body = this.stage.world.createBody({
      type: 'static',
      position: Vec2(0, 0)
    })
    this.body.setUserData(this)
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
    if (this.stage.flags.spawn) {
      this.spawnPoints.forEach(point => {
        const collided = point.collideCount > 0
        const color = collided ? RED : GREEN
        const transparent = { ...color, alpha: 0.1 }
        this.stage.debugCircle({
          circle: new Circle(point.position, Spawnpoint.RADIUS),
          color: transparent
        })
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
    const area = this.stage.halfHeight * this.stage.halfWidth * 4
    this.stage.flag({ f: 'spawn', k: 'area', v: area })
    const organismCap = area / 100
    this.stage.flag({ f: 'spawn', k: 'organismCap', v: organismCap })
    function sigmoid (x: number): number {
      return 1 / (1 + Math.exp(-x))
    }
    const sigmaArea = sigmoid(area / 1000)
    this.stage.flag({ f: 'spawn', k: 'sigmaArea', v: sigmaArea })
    const familyCap = 8 - (3 * 1 / sigmaArea)
    this.stage.flag({ f: 'spawn', k: 'familyCap', v: familyCap })
    const organismsNeeded = organisms.length < organismCap
    const familiesNeeded = families.size < familyCap
    const needed = organismsNeeded || familiesNeeded
    const living = this.stage.killingQueue.length === 0 && this.stage.starvationQueue.length === 0
    const respawnable = living && this.queue.length > 0 && needed
    if (respawnable) {
      this.stage.flag({ f: 'spawn', vs: ['respawnQueue.length', this.queue.length] })
      this.stage.flag({ f: 'spawn', vs: ['spawnPoints.length', this.spawnPoints.length] })
      const clearSpawnPoints = this.stage.spawner.spawnPoints.filter(spawnPoint => spawnPoint.collideCount < 1)
      this.stage.flag({ f: 'spawn', vs: ['clearSpawnPoints.length', clearSpawnPoints.length] })
      if (clearSpawnPoints.length > 0) {
        const first = this.stage.spawner.queue.shift()
        if (first == null) {
          throw new Error('There is no first')
        }
        // TODO longest path away
        const spawnpoint = this.getFarthest({ obituary: first, spawnpoints: clearSpawnPoints })
        const gene = first.gene.mutate()
        void new Organism({ ...first, gene, position: spawnpoint.position, stage: this.stage })
      }
    }
  }

  setupSpawnPoints (): void {
    if (this.stage.flags.waypointSpawnpointsGame) {
      const waypoints = [...this.stage.navigation.waypoints.values()]
      if (waypoints == null) {
        throw new Error('There are no waypoints')
      }
      this.spawnPoints = waypoints.map(waypoint => {
        return new Spawnpoint(this, waypoint.position)
      })
    } else {
      this.spawnPoints = [
        new Spawnpoint(this, Vec2(5, 5)),
        new Spawnpoint(this, Vec2(15, 15))
      ]
    }
  }
}
