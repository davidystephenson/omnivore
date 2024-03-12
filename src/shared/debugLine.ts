import { Vec2 } from 'planck'
import { Color } from './color'

export class DebugLine {
  anchorA: Vec2
  anchorB: Vec2
  color: Color

  constructor (props: {
    anchorA: Vec2
    anchorB: Vec2
    color: Color
  }) {
    this.anchorA = props.anchorA
    this.anchorB = props.anchorB
    this.color = props.color
  }

  onStep (): void {
    // this.invincibleTime = Math.max(0, this.invincibleTime - this.stage.runner.timeStep)
  }
}
