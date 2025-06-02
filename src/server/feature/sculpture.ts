import { Vec2, PolygonShape } from 'planck'
import { Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'
import { Feature } from './feature'
import { Crate } from './crate'
import { Debris } from '../actor/debris'

export class Sculpture extends Prop {
  constructor (props: {
    actor: Actor
    color?: Rgb
    health?: number
    label?: string
    position: Vec2
    vertices: Vec2[]
  }) {
    const label = props.label ?? 'sculpture'
    super({
      position: props.position,
      actor: props.actor,
      health: props.health,
      shape: new PolygonShape(props.vertices),
      color: props.color,
      label
    })
  }

  handleContact (props: {
    target: Feature
  }): void {
    if (props.target.actor instanceof Debris) {
      this.dealDamage({ target: props.target })
    }
  }
}
