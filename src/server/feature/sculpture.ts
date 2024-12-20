import { Vec2, PolygonShape } from 'planck'
import { Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'

export class Sculpture extends Prop {
  constructor (props: {
    position: Vec2
    actor: Actor
    color?: Rgb
    vertices: Vec2[]
  }) {
    super({
      position: props.position,
      actor: props.actor,
      shape: new PolygonShape(props.vertices),
      color: props.color,
      label: 'sculpture'
    })
  }
}
