import { Vec2 } from 'planck'
import { Navigation } from './navigation'

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
  neighbors = new Map<number, Waypoint[]>()
  nextWaypoints = new Map<number, Waypoint[]>()
  pathDistances = new Map<number, number[]>()
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
}
