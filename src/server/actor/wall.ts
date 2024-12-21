import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { Structure } from '../feature/structure'
import { Waypoint } from '../waypoint'

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

  constructor (props: {
    stage: Stage
    halfHeight: number
    halfWidth: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'wall' })
    this.halfHeight = props.halfHeight
    this.halfWidth = props.halfWidth
    this.position = props.position
    this.structure = new Structure({
      position: props.position,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      actor: this
    })
    this.features.push(this.structure)
  }
}
