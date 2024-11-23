import { Vec2, Body, Circle } from 'planck'
import { Spawnpoint } from './spawnpoint'
import { Stage } from './stage'
import { RED, GREEN } from '../shared/color'

export class Spawner {
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

  setupSpawnPoints (): void {
    const waypoints = this.stage.navigation.radiiWaypoints.get(this.stage.navigation.radii[0])
    if (waypoints == null) {
      throw new Error('There are no waypoints')
    }
    const locations = waypoints.map(waypoint => waypoint.position)
    this.spawnPoints = locations.map(location => new Spawnpoint(this, location))
  }

  onStep (): void {
    if (!this.stage.flags.respawn) {
      return
    }
    this.spawnPoints.forEach(point => {
      const collided = point.collideCount > 0
      const color = collided ? RED : GREEN
      this.stage.debugCircle({
        circle: new Circle(point.location, 1.25),
        color
      })
    })
  }
}
