import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { Crate } from '../feature/crate'
import { Rgb } from '../../shared/color'

export class Brick extends Actor {
  crate: Crate

  constructor (props: {
    angle?: number
    color?: Rgb
    halfWidth: number
    halfHeight: number
    position: Vec2
    stage: Stage
  }) {
    super({ stage: props.stage, label: 'brick' })
    this.crate = new Crate({
      actor: this,
      angle: props.angle,
      color: props.color,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      position: props.position
    })
    this.invincibleTime = 0.1
    this.features.push(this.crate)
  }

  onStep (props: {
    stepSize: number
  }): void {
    super.onStep({ stepSize: props.stepSize })
  }
}
