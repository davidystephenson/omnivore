import { AABB, Vec2 } from 'planck'
import { Waypoint } from './waypoint'
import { Stage } from './stage/stage'

export interface NavAreaDef {
  aabb: {
    upperBound: { x: number, y: number }
    lowerBound: { x: number, y: number }
  }
}

export class NavArea {
  stage: Stage
  waypoints: Waypoint[] = []
  aabb: AABB

  constructor (props: {
    stage: Stage
  } & NavAreaDef) {
    this.stage = props.stage
    this.aabb = new AABB(props.aabb.lowerBound, props.aabb.upperBound)
    const waypointArray = Object.values(this.stage.navigation.waypoints)
    waypointArray.forEach(waypoint => {
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
