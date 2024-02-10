import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Crate } from '../feature/crate'

export class Brick extends Actor {
  constructor (props: {
    stage: Stage
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'wall' })
    const crate = new Crate({
      position: props.position,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      actor: this
    })
    this.features.push(crate)
  }
}
