import { Vec2, Circle, Fixture } from 'planck'
import { Feature } from './feature'
import { Organism } from '../actor/organism'
import { Killing } from '../killing'
import { Structure } from './structure'
import { directionFromTo } from '../math'
import { Tree } from '../actor/tree'
import { Food } from '../actor/food'

export class Membrane extends Feature {
  actor: Organism
  destroyed = false
  hungerDamage = 0
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
        linearDamping: 0.0
      },
      fixtureDef: {
        shape: new Circle(Vec2(0, 0), radius),
        density: 1,
        restitution: 0,
        friction: 0
      },
      label: 'membrane',
      actor: props.actor,
      color: props.actor.color
    })
    this.actor = props.actor
    this.radius = radius
    this.sensor = this.addSensor()
  }

  destroy (): void {
    this.destroyed = true
    const nutrition = this.maximumHealth / 10
    const foodRatio = this.combatDamage / nutrition
    const foodCount = Math.floor(foodRatio)
    for (let i = 0; i < foodCount; i++) {
      this.actor.stage.addFoodSquare({
        position: this.position
      })
    }
    super.destroy()
  }

  doDamage (target: Feature): void {
    if (target instanceof Membrane) {
      if (target.actor.color === this.actor.color) {
        return
      }
    }
    const ratio = this.body.getMass() / target.body.getMass()
    const factor = 1.5
    target.combatDamage += 0.05 * Math.pow(ratio, factor)
    target.health = target.getHealth()

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
      if (target.actor instanceof Tree) {
        target.actor.fall()
      } else {
        if (target.actor instanceof Food) {
          const nutrition = this.maximumHealth / 10
          this.heal({ value: nutrition })
        }
        target.actor.destroy()
      }
    }
  }

  getHealth (): number {
    const combatHealth = super.getHealth()
    const health = combatHealth - this.hungerDamage
    return health
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

  heal (props: { value: number }): void {
    if (this.hungerDamage >= 0) {
      this.hungerDamage -= props.value
    } else if (this.combatDamage > props.value) {
      this.combatDamage -= props.value
    } else {
      this.reproduce()
    }
  }

  onStep (): void {
    this.handleContacts()
    if (
      this.actor.stage.flags.hungerY &&
      this.health > 0 &&
      !this.destroyed &&
      !this.actor.dead
    ) {
      const seconds = 180
      const hunger = 1 / (10 * seconds)
      this.hungerDamage += hunger
      this.health = this.getHealth()
      if (this.health <= 0) {
        this.actor.starve({ membrane: this })
      }
    }
  }

  push (target: Feature): void {
    const ratio = this.body.getMass() / target.body.getMass()
    const forceScale = 100 * ratio
    const direction = directionFromTo(this.body.getPosition(), target.body.getPosition())
    const force = Vec2.mul(direction, forceScale)
    target.body.applyForceToCenter(force)
  }

  reproduce (): void {
    const bot = this.actor.stage.addBot({
      color: this.actor.color,
      gene: this.actor.gene,
      position: this.position
    })
    const half = this.maximumHealth / 2
    bot.membrane.hungerDamage = half
    this.hungerDamage = half
  }
}
