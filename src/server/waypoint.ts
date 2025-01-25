import { AABB, Fixture, Vec2 } from 'planck'
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
    const aabb = new AABB(this.position, this.position)
    const xInside = Math.abs(this.position.x) < this.navigation.stage.halfWidth
    const yInside = Math.abs(this.position.y) < this.navigation.stage.halfHeight
    let open = xInside && yInside
    this.navigation.stage.world.queryAABB(aabb, (fixture: Fixture) => {
      open = false
      return false
    })
    if (open) {
      this.navigation.waypoints.set(this.id, this)
    }
  }
}
