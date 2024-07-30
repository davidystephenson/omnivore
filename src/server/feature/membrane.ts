import { Vec2, Circle } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Organism } from '../actor/organism'
import { Killing } from '../killing'
import { Structure } from './structure'

export class Membrane extends Feature {
  actor: Organism
  destroyed = false
  radius: number
  forceScale = 1

  constructor (props: {
    position: Vec2
    actor: Organism
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

  handleContacts (): void {
    this.contacts.forEach(target => {
      if (target instanceof Structure) return
      if (target.actor === this.actor) return
      this.doDamage(target)
    })
  }

  doDamage (target: Feature): void {
    target.health -= 0.5
    if (target.health <= 0) {
      if (target instanceof Membrane) {
        const killing = new Killing({
          victim: target,
          stage: this.actor.stage,
          killer: this
        })
        this.actor.stage.killingQueue.push(killing)
        return
      }
      target.destroy()
    }
  }

  destroy (): void {
    this.destroyed = true
  }

  onStep (): void {
    this.handleContacts()
    const hunger = false
    if (
      hunger &&
      this.health > 0 &&
      !this.destroyed &&
      !this.actor.dead
    ) {
      const seconds = 60
      this.health -= 1 / (10 * seconds)
      if (this.health <= 0) {
        this.actor.starve({ membrane: this })
      }
    }
  }
}
