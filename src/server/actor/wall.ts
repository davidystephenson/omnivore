import { AABB, Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { Structure } from '../feature/structure'
import { Waypoint } from '../waypoint'

export interface WallDef {
  halfHeight: number
  halfWidth: number
  position: { x: number, y: number }
}

export class Wall extends Actor {
  halfHeight: number
  halfWidth: number
  position: Vec2
  structure: Structure
  cornerWaypoints: Waypoint[] = []
  topWaypoints: Waypoint[] = []
  bottomWaypoints: Waypoint[] = []
  rightWaypoints: Waypoint[] = []
  leftWaypoints: Waypoint[] = []
  top: number
  bottom: number
  left: number
  right: number
  aabb: AABB

  constructor (props: {
    stage: Stage
  } & WallDef) {
    super({ stage: props.stage, label: 'wall' })
    this.halfHeight = props.halfHeight
    this.halfWidth = props.halfWidth
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
