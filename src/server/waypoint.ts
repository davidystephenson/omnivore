import { AABB, Fixture, Vec2 } from 'planck'
import { Navigation } from './navigation'

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
    position: Vec2
    navigation: Navigation
    radius: number
    category?: string
  }) {
    this.category = props.category ?? ''
    this.position = props.position
    this.navigation = props.navigation
    this.radius = props.radius
    const keys = [0, ...this.navigation.waypoints.keys()]
    this.id = Math.max(...keys) + 1
    const aabb = new AABB(this.position, this.position)
    const xInside = Math.abs(this.position.x) < this.navigation.stage.halfWidth
    const yInside = Math.abs(this.position.y) < this.navigation.stage.halfHeight
    let open = xInside && yInside
    this.navigation.stage.world.queryAABB(aabb, (fixture: Fixture) => {
      open = false
      return false
    })
    if (open) this.navigation.waypoints.set(this.id, this)
  }
}
