import { Vec2, PolygonShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'

export class Sculpture extends Prop {
  seed?: {
    vertices: Vec2[]
  }

  constructor (props: {
    position: Vec2
    actor: Actor
    color?: Color
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
