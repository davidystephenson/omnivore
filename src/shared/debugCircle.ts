import { Vec2 } from 'planck'
import { Color } from './color'
import { CircleFigure } from './circleFigure'

export class DebugCircle extends CircleFigure {
  color: Color

  constructor (props: {
    position: Vec2
    radius: number
    color: Color
  }) {
    super({ position: props.position, radius: props.radius })
    this.color = props.color
  }
}
