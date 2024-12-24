import { AABB, Vec2 } from 'planck'
import { Waypoint } from './waypoint'
import { Stage } from './stage/stage'

export class NavArea {
  stage: Stage
  waypoints: Waypoint[] = []
  aabb: AABB

  constructor (stage: Stage, aabb: AABB) {
    this.stage = stage
    this.aabb = aabb
    this.stage.navigation.waypoints.forEach(waypoint => {
      if (waypoint.radius === this.stage.navigation.bigRadius) return
      if (this.testPoint(waypoint.position)) this.waypoints.push(waypoint)
    })
  }

  testPoint (point: Vec2): boolean {
    if (point.y >= this.aabb.upperBound.y) return false
    if (point.y <= this.aabb.lowerBound.y) return false
    if (point.x >= this.aabb.upperBound.x) return false
    if (point.x <= this.aabb.lowerBound.x) return false
    return true
  }
}
