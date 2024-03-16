import { Vec2, Shape } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Actor } from '../actor/actor'

export class Chunk extends Feature {
  constructor (props: {
    position: Vec2
    actor: Actor
    shape: Shape
    label: string
    color: Color
  }) {
    super({
      bodyDef: {
        type: 'dynamic',
        position: props.position,
        bullet: true,
        linearDamping: 0.1,
        angularDamping: 0.1
      },
      fixtureDef: {
        shape: props.shape,
        density: 1,
        restitution: 0,
        friction: 0
      },
      label: props.label,
      actor: props.actor,
      color: props.color
    })
  }
}
