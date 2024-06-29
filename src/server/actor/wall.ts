import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Structure } from '../feature/structure'
import { normalize } from '../math'

export class Wall extends Actor {
  halfHeight: number
  halfWidth: number
  position: Vec2
  structure: Structure
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

  setupWaypoints (): void {
    const corners = [
      Vec2(this.position.x + this.halfWidth, this.position.y + this.halfHeight),
      Vec2(this.position.x - this.halfWidth, this.position.y + this.halfHeight),
      Vec2(this.position.x + this.halfWidth, this.position.y - this.halfHeight),
      Vec2(this.position.x - this.halfWidth, this.position.y - this.halfHeight)
    ]
    const offsets = [Math.sqrt(2)]
    corners.forEach(corner => {
      const direction = normalize(Vec2(
        Math.sign(corner.x - this.position.x),
        Math.sign(corner.y - this.position.y)
      ))
      offsets.forEach(offset => {
        const position = Vec2.combine(1, corner, offset, direction)
        this.stage.navigation.addWaypoint(position)
      })
    })
  }
}
