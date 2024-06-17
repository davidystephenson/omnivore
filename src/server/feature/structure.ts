import { Vec2, Box } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Feature } from './feature'

export class Structure extends Feature {
  constructor (props: {
    position: Vec2
    actor: Actor
    halfHeight: number
    halfWidth: number
  }) {
    super({
      bodyDef: {
        type: 'static',
        position: props.position
      },
      fixtureDef: {
        shape: Box(props.halfWidth, props.halfHeight),
        density: 1,
        restitution: 0,
        friction: 0
      },
      label: 'barrier',
      actor: props.actor,
      color: Color.BLUE
    })
  }
}
