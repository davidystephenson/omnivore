import { Vec2, Circle } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Player } from '../actor/player'

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
      color: Color.GREEN
    })
    this.actor = props.actor
    this.radius = radius
  }

  onStep (): void {
    this.health -= 0.003
    if (this.health <= 0) {
      this.actor.stage.respawnQueue.push(this.actor)
      // TODO Spawn a box
    }
  }
}
