import { Vec2 } from 'planck'
import { Color } from './color'
import { LineFigure } from './lineFigure'

export class DebugLine extends LineFigure {
  color: Color

  constructor (props: {
    a: Vec2
    b: Vec2
    color: Color
  }) {
    super({ a: props.a, b: props.b })
    this.color = props.color
  }
}
