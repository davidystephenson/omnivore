import { Vec2, Circle } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Player } from '../actor/player'

console.log('Feature (mouth)', Feature)

export class Mouth extends Feature {
  radius: number
  actor: Player
  constructor (props: {
    position: Vec2
    actor: Player
    radius?: number
  }) {
    const radius = props.radius ?? 1
    super({
      bodyDef: {
        type: 'dynamic',
        position: props.position,
        bullet: true,
        fixedRotation: true,
        linearDamping: 0.1
      },
      fixtureDef: {
        shape: new Circle(Vec2(0, 0), radius),
        density: 1,
        restitution: 0,
        friction: 0
      },
      label: 'mouth',
      actor: props.actor,
      color: new Color({ red: 0, green: 128, blue: 0 })
    })
    this.actor = props.actor
    this.radius = radius
  }
}
