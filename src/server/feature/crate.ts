import { Vec2, BoxShape } from 'planck'
import { CYAN, Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'

export class Crate extends Prop {
  constructor (props: {
    actor: Actor
    color?: Rgb
    angle?: number
    halfWidth: number
    halfHeight: number
    health?: number
    position: Vec2
  }) {
    const color = props.color ?? CYAN
    const shape = new BoxShape(
      props.halfWidth, props.halfHeight, Vec2(0, 0), props.angle
    )
    super({
      actor: props.actor,
      color,
      health: props.health,
      label: 'crate',
      position: props.position,
      shape
    })
  }
}
