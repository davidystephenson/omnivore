import { Vec2, Shape } from 'planck'
import { CYAN, Rgb } from '../../shared/color'
import { Feature } from './feature'
import { Actor } from '../actor/actor'

export class Prop extends Feature {
  blockCount = 0
  constructor (props: {
    position: Vec2
    actor: Actor
    health?: number
    shape: Shape
    label: string
    color?: Rgb
    density?: number
  }) {
    const color = props.color ?? CYAN
    const density = props.density ?? 1
    super({
      bodyDef: {
        type: 'dynamic',
        position: props.position,
        bullet: true,
        linearDamping: Feature.DAMPING,
        angularDamping: Feature.DAMPING
      },
      fixtureDef: {
        shape: props.shape,
        density,
        restitution: 0,
        friction: 0
      },
      health: props.health,
      label: props.label,
      actor: props.actor,
      color
    })
  }
}
