import { Vec2, BoxShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Chunk } from './chunk'

export class Crate extends Chunk {
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
      label: 'crate',
      name: 'rectangle'
    })
  }
}
