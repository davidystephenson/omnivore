import { AABB, Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { Structure } from '../feature/structure'
import { Waypoint } from '../waypoint'
import { WallDef } from '../types'

export class Wall extends Actor {
  aabb: AABB
  bottom: number
  bottomWaypoints: Waypoint[] = []
  cornerWaypoints: Waypoint[] = []
  halfHeight: number
  halfWidth: number
  left: number
  leftWaypoints: Waypoint[] = []
  outer: boolean
  position: Vec2
  right: number
  rightWaypoints: Waypoint[] = []
  structure: Structure
  top: number
  topWaypoints: Waypoint[] = []

  constructor (props: {
    stage: Stage
  } & WallDef) {
    super({ stage: props.stage, label: 'wall' })
    this.halfHeight = props.halfHeight
    this.halfWidth = props.halfWidth
    this.outer = props.outer
    this.position = Vec2(props.position.x, props.position.y)
    this.structure = new Structure({
      position: this.position,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      actor: this
    })
    this.features.push(this.structure)
    this.top = this.position.y + this.halfHeight
    this.bottom = this.position.y - this.halfHeight
    this.right = this.position.x + this.halfWidth
    this.left = this.position.x - this.halfWidth
    this.aabb = new AABB(Vec2(this.left, this.bottom), Vec2(this.right, this.top))
  }
}
