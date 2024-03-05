import { Vec2, Box } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Player } from '../actor/player'

export class Egg extends Feature {
  actor: Player
  constructor (props: {
    actor: Player
    position: Vec2
    hx: number
    hy: number
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
        shape: new Box(props.hx, props.hy),
        density: 1,
        restitution: 0,
        friction: 0
      },
      label: 'egg',
      actor: props.actor,
      color: new Color({ red: 178, green: 178, blue: 178 }),
      borderColor: new Color({ red: 255, green: 255, blue: 255 })
    })
    this.actor = props.actor
  }
}
