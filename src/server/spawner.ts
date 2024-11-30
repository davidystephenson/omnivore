import { Vec2, Body, Circle } from 'planck'
import { Spawnpoint } from './spawnpoint'
import { Stage } from './stage/stage'
import { RED, GREEN } from '../shared/color'
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
    if (this.stage.flags.respawn) {
      this.spawnPoints.forEach(point => {
        const collided = point.collideCount > 0
        const color = collided ? RED : GREEN
        this.stage.debugCircle({
          circle: new Circle(point.position, 0.2),
          color
        })
      })
    }

    const living = this.stage.killingQueue.length === 0 && this.stage.starvationQueue.length === 0
    const respawnable = living && this.queue.length > 0
    if (respawnable) {
      this.stage.flag({ f: 'respawn', vs: ['respawnQueue.length', this.queue.length] })
      this.stage.flag({ f: 'respawn', vs: ['spawnPoints.length', this.spawnPoints.length] })
      const clearSpawnPoints = this.stage.spawner.spawnPoints.filter(spawnPoint => spawnPoint.collideCount < 1)
      this.stage.flag({ f: 'respawn', vs: ['clearSpawnPoints.length', clearSpawnPoints.length] })
      let clearSpawnPositions = clearSpawnPoints.map(spawnPoint => spawnPoint.position)
      // TODO longest path away
      if (clearSpawnPositions.length > 0) {
        this.stage.spawner.queue = this.stage.spawner.queue.filter(obituary => {
          if (clearSpawnPositions.length < 1) {
            return true
          }
          const spawnpoint = this.getFarthest({ obituary, spawnpoints: clearSpawnPoints })
          clearSpawnPositions = clearSpawnPositions.filter(position => position !== spawnpoint.position)
          const gene = obituary.gene.mutate()
          void new Organism({ ...obituary, gene, position: spawnpoint.position, stage: this.stage })
          return false
        })
      }
    }
  }

  setupSpawnPoints (): void {
    if (this.stage.flags.waypointSpawnpointsY) {
      const waypoints = this.stage.navigation.radiiWaypoints.get(this.stage.navigation.radii[0])
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
