import { Vec2, BoxShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'

export class Crate extends Prop {
  constructor (props: {
    actor: Actor
    angle?: number
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    const shape = new BoxShape(props.halfWidth, props.halfHeight, Vec2(0, 0), props.angle)
    super({
      position: props.position,
      actor: props.actor,
      shape,
      color: Color.CYAN,
      label: 'crate'
    })
  }
}
