import { Vec2 } from 'planck'

export class CircleFigure {
  position: Vec2
  radius: number

  constructor (props: {
    position: Vec2
    radius: number
  }) {
    this.position = props.position
    this.radius = props.radius
  }
}
