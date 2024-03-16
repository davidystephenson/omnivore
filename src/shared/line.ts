import { Vec2 } from 'planck'

export class Line {
  a: Vec2
  b: Vec2

  constructor (props: {
    a: Vec2
    b: Vec2
  }) {
    this.a = props.a
    this.b = props.b
  }
}
