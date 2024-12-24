import { AABB, Vec2 } from 'planck'
import { Waypoint } from './waypoint'

export class NavArea {
  waypoints: Waypoint[] = []
  aabb: AABB

  constructor (top: number, bottom: number, right: number, left: number, maxRadius: number) {
    const lower = Vec2(left, bottom)
    const upper = Vec2(right, top)
    this.aabb = new AABB(lower, upper)
  }
}
