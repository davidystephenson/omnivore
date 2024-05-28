import { Vec2, PolygonShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Chunk } from './chunk'

export class Triangle extends Chunk {
  constructor (props: {
    position: Vec2
    actor: Actor
    vertices: [Vec2, Vec2, Vec2]
  }) {
    super({
      position: props.position,
      actor: props.actor,
      shape: new PolygonShape(props.vertices),
      color: Color.CYAN,
      label: 'crate',
      name: 'triangle'
    })
  }
}
