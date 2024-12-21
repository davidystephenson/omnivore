import { AABB, Vec2 } from 'planck'
import { Waypoint } from './waypoint'

export class NavArea {
  waypoints: Waypoint[]
  aabb: AABB

  constructor (bigWaypoints: Waypoint[], maxRadius: number) {
    this.waypoints = bigWaypoints
    const xs = this.waypoints.map(waypoint => waypoint.position.x)
    const ys = this.waypoints.map(waypoint => waypoint.position.y)
    const top = Math.max(...ys) + maxRadius
    const bottom = Math.min(...ys) - maxRadius
    const right = Math.max(...xs) + maxRadius
    const left = Math.min(...xs) - maxRadius
    const lower = Vec2(left, bottom)
    const upper = Vec2(right, top)
    this.aabb = new AABB(lower, upper)
  }
}
