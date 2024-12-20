import { Vec2, BoxShape } from 'planck'
import { CYAN, Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'

export class Crate extends Prop {
  constructor (props: {
    actor: Actor
    color?: Rgb
    angle?: number
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    const color = props.color ?? CYAN
    const shape = new BoxShape(props.halfWidth, props.halfHeight, Vec2(0, 0), props.angle)
    super({
      position: props.position,
      actor: props.actor,
      shape,
      color,
      label: 'crate'
    })
  }
}
