import { Vec2, Circle } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Player } from '../actor/player'

export class Membrane extends Feature {
  actor: Player
  destroyed = false
  radius: number
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
      label: 'membrane',
      actor: props.actor,
      color: Color.GREEN
    })
    this.actor = props.actor
    this.radius = radius
  }

  destroy (): void {
    this.destroyed = true
  }

  onStep (): void {
    // const seconds = 60
    // this.health -= 1 / (60 * seconds)
    // if (this.health <= 0 && !this.destroyed && !this.actor.dead) {
    //   this.actor.starve({ membrane: this })
    // }
  }
}
