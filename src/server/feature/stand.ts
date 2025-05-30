import { Vec2 } from 'planck'
import { Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Feature } from './feature'
import { Sculpture } from './sculpture'
import { River } from '../actor/river'

export class Stand extends Sculpture {
  constructor (props: {
    actor: Actor
    color?: Rgb
    health?: number
    label?: string
    position: Vec2
    vertices: Vec2[]
  }) {
    const label = props.label ?? 'Stand'
    super({
      actor: props.actor,
      color: props.color,
      health: props.health,
      label,
      position: props.position,
      vertices: props.vertices
    })
  }

  handleContact (props: {
    target: Feature
  }): void {
    if (props.target.actor instanceof River) {
      this.dealDamage({ target: props.target })
    }
  }
}
