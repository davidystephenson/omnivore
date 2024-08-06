import { Vec2, Circle, Box, Fixture } from 'planck'
import { Color } from '../../shared/color'
import { Feature } from './feature'
import { Organism } from '../actor/organism'
import { Killing } from '../killing'
import { Structure } from './structure'
import { HALF_SIGHT } from '../../shared/sight'
import { directionFromTo } from '../math'

export class Membrane extends Feature {
  actor: Organism
  destroyed = false
  radius: number
  acceleration = 1
  sensor: Fixture

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
    this.sensor = this.body.createFixture({
      shape: Box(HALF_SIGHT.x, HALF_SIGHT.y),
      isSensor: true
    })
    this.sensor.setUserData(this)
  }

  handleContacts (): void {
    this.contacts.forEach(target => {
      if (target instanceof Structure) return
      if (target.actor === this.actor) return
      this.doDamage(target)
      if (target instanceof Membrane) {
        this.push(target)
      }
    })
  }

  push (target: Feature): void {
    const ratio = this.body.getMass() / target.body.getMass()
    const forceScale = 100 * ratio
    const direction = directionFromTo(this.body.getPosition(), target.body.getPosition())
    const force = Vec2.mul(direction, forceScale)
    target.body.applyForceToCenter(force)
  }

  doDamage (target: Feature): void {
    const ratio = this.body.getMass() / target.body.getMass()
    target.health -= 0.03 * Math.pow(ratio, 2)
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
