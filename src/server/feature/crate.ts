import { Vec2, BoxShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Chunk } from './chunk'

export class Crate extends Chunk {
  constructor (props: {
    position: Vec2
    actor: Actor
    halfWidth: number
    halfHeight: number
  }) {
    super({
      position: props.position,
      actor: props.actor,
      shape: new BoxShape(props.halfWidth, props.halfHeight),
      color: Color.CYAN,
      label: 'crate',
      name: 'rectangle'
    })
  }
}
