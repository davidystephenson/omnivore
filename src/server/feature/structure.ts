import { Vec2, Box } from 'planck'
import { COLOR } from '../../shared/color'
import { Feature } from './feature'
import { Wall } from '../actor/wall'
import { River } from '../actor/river'

export class Structure extends Feature {
  wall: Wall
  constructor (props: {
    position: Vec2
    actor: Wall
    halfHeight: number
    halfWidth: number
  }) {
    const color = props.actor.outer ? COLOR.DARK_BLUE : COLOR.BLUE
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
      label: 'structure',
      actor: props.actor,
      color
    })
    this.wall = props.actor
  }

  handleContact (props: { target: Feature }): void {
    super.handleContact({ target: props.target })
    if (this.wall.outer && props.target.actor instanceof River) {
      this.dealDamage({ damage: 0.0001, target: props.target })
    }
  }
}
