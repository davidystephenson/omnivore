import { Vec2, PolygonShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'

export class Sculpture extends Prop {
  constructor (props: {
    position: Vec2
    actor: Actor
    vertices: Vec2[]
  }) {
    super({
      position: props.position,
      actor: props.actor,
      shape: new PolygonShape(props.vertices),
      color: Color.CYAN,
      label: 'crate'
    })
  }
}
