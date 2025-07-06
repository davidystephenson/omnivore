import { Vec2 } from 'planck'
import { Navigation } from './navigation'
import { WaypointDef } from './types'

export class Waypoint {
  navigation: Navigation
  position: Vec2
  id: number
  neighbors: Record<number, Record<number, Waypoint>> = {}
  pathDistances: Record<number, Record<number, number>> = {}
  nextWaypoints: Record<number, Record<number, Waypoint>> = {}
  distances: number[] = []

  constructor (props: {
    navigation: Navigation
  } & WaypointDef) {
    this.position = Vec2(props.position.x, props.position.y)
    this.navigation = props.navigation
    this.id = props.id
  }

  getNextWaypointIds (props: {
    radius: number
  }): Record<number, number> {
    const radiusNextWaypoints = this.nextWaypoints[props.radius]
    const targetIds = Object.keys(radiusNextWaypoints).map(s => Number(s))
    const radiusNextWaypointIds: Record<number, number> = {}
    targetIds.forEach(targetId => {
      radiusNextWaypointIds[targetId] = radiusNextWaypoints[targetId].id
    })
    return radiusNextWaypointIds
  }
}
