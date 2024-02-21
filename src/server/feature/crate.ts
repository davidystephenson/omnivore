import { Vec2, BoxShape } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Actor } from '../actor/actor'

export class Crate extends Feature {
  constructor (props: {
    position: Vec2
    actor: Actor
    halfWidth: number
    halfHeight: number
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
        shape: new BoxShape(props.halfWidth, props.halfHeight),
        density: 1,
        restitution: 0,
        friction: 0
      },
      label: 'player',
      actor: props.actor,
      color: new Color({ red: 200, green: 200, blue: 200 }),
      borderColor: new Color({ red: 225, green: 225, blue: 225 })
    })
  }
}
