import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Crate } from '../feature/crate'
import { Rgb } from '../../shared/color'
import { Debris } from './debris'

export class Rock extends Debris {
  crate: Crate
  halfHeight: number
  halfWidth: number

  constructor (props: {
    angle?: number
    color?: Rgb
    halfWidth: number
    halfHeight: number
    health?: number
    position: Vec2
    stage: Stage
  }) {
    super({ stage: props.stage, label: 'brick' })
    this.crate = new Crate({
      actor: this,
      angle: props.angle,
      color: props.color,
      health: props.health,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      position: props.position
    })
    this.halfWidth = props.halfWidth
    this.halfHeight = props.halfHeight
    this.invincibleTime = 0.1
    this.features.push(this.crate)
  }

  getArea (): number {
    const area = this.halfWidth * this.halfHeight * 4
    return area
  }

  onStep (props: {
    stepSize: number
  }): void {
    super.onStep({ stepSize: props.stepSize })
  }
}
