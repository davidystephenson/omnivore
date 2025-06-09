import { Vec2 } from 'planck'
import { Navigation } from './navigation'
import { WaypointData } from './types'

export interface WaypointDef {
  position: { x: number, y: number }
  radius: number
  category?: string
  id: number
}

export class Waypoint {
  navigation: Navigation
  position: Vec2
  id: number
  category: string
  neighbors: Record<number, Record<number, Waypoint>> = {}
  pathDistances: Record<number, Record<number, number>> = {}
  nextWaypoints: Record<number, Record<number, Waypoint>> = {}
  distances: number[] = []
  radius: number

  constructor (props: {
    navigation: Navigation
  } & WaypointDef) {
    this.category = props.category ?? ''
    this.position = Vec2(props.position.x, props.position.y)
    this.navigation = props.navigation
    this.radius = props.radius
    this.id = props.id
  }

  getData (): WaypointData {
    const radii = Object.keys(this.neighbors).map(r => Number(r))
    const neighbors: Record<number, number[]> = {}
    radii.forEach(radius => {
      const waypointArray = Object.values(this.neighbors[radius])
      if (waypointArray == null) throw new Error(`Missing neighbors for radius ${radius}`)
      neighbors[radius] = waypointArray.map(waypoint => waypoint.id)
    })
    const pathDistances: Record<number, Record<number, number>> = {}
    radii.forEach(radius => {
      const distanceRecord = this.pathDistances[radius]
      pathDistances[radius] = distanceRecord
    })
    const nextWaypoints: Record<number, Record<number, number>> = {}
    radii.forEach(radius => {
      const radiusNextWaypoints = this.nextWaypoints[radius]
      const targetIds = Object.keys(radiusNextWaypoints).map(s => Number(s))
      const radiusNextWaypointIds: Record<number, number> = {}
      targetIds.forEach(targetId => { radiusNextWaypointIds[targetId] = radiusNextWaypoints[targetId].id })
      nextWaypoints[radius] = radiusNextWaypointIds
    })
    return {
      position: { x: this.position.x, y: this.position.y },
      id: this.id,
      radius: this.radius,
      category: this.category,
      nextWaypoints
    }
  }
}
