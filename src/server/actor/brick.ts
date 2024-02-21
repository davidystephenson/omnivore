import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Crate } from '../feature/crate'

export class Brick extends Actor {
  crate: Crate

  constructor (props: {
    stage: Stage
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'wall' })
    this.crate = new Crate({
      position: props.position,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      actor: this
    })
    this.features.push(this.crate)
  }

  onStep (): void {
    super.onStep()
    const colliding = this.crate.body.getContactList() != null
    if (colliding) this.crate.health -= 0.01
    if (this.crate.health <= 0) this.stage.destructionQueue.push(this.crate.body)
    this.crate.color.alpha = this.crate.health
  }
}
