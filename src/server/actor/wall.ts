import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Structure } from '../feature/structure'

export class Wall extends Actor {
  barrier: Structure
  constructor (props: {
    stage: Stage
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'wall' })
    this.barrier = new Structure({
      position: props.position,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      actor: this
    })
    this.features.push(this.barrier)
  }
}
