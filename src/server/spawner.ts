import { Vec2, Body } from 'planck'
import { SpawnPoint } from './spawnpoint'
import { Stage } from './stage'

export class Spawner {
  stage: Stage
  spawnPoints: SpawnPoint[] = []
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
    this.spawnPoints = locations.map(location => new SpawnPoint(this, location))
  }
}
