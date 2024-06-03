import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Crate } from '../feature/crate'

export class Brick extends Actor {
  crate: Crate

  constructor (props: {
    angle?: number
    halfWidth: number
    halfHeight: number
    position: Vec2
    stage: Stage
  }) {
    super({ stage: props.stage, label: 'brick' })
    this.crate = new Crate({
      actor: this,
      angle: props.angle,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      position: props.position
    })
    this.invincibleTime = 0.1
    this.features.push(this.crate)
  }

  onStep (): void {
    super.onStep()
  }
}
