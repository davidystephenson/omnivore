import { Vec2, Circle } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Actor } from '../actor/actor'

export class Mouth extends Feature {
  constructor (props: {
    position: Vec2
    actor: Actor
  }) {
    super({
      bodyDef: {
        type: 'dynamic',
        position: props.position,
        bullet: true,
        fixedRotation: true,
        linearDamping: 0.1
      },
      fixtureDef: {
        shape: new Circle(Vec2(0, 0), 1),
        density: 1,
        restitution: 0
      },
      label: 'mouth',
      actor: props.actor,
      color: new Color({ red: 0, green: 128, blue: 0 }),
      borderColor: new Color({ red: 0, green: 0, blue: 255 })
    })
  }
}
