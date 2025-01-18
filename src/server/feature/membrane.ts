import { Vec2, Circle, Fixture } from 'planck'
import { Feature } from './feature'
import { Organism } from '../actor/organism'
import { Killing } from '../death/killing'
import { directionFromTo } from '../math'
import { Tree } from '../actor/tree'
import { Food } from '../actor/food'
import { Runner } from '../runner'
import { Prop } from './prop'

export class Membrane extends Feature {
  static BASE_DAMAGE = 0.1
  static DAMAGE_FACTOR = 3
  static MINIMUM_LIFE_SECONDS = 30
  static GENETIC_LIFE_SECONDS = 150
  actor: Organism
  destroyed = false
  hungerDamage = 0
  mass: number
  radius: number
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
      color: props.actor.color
    })
    this.actor = props.actor
    this.mass = this.body.getMass()
    this.radius = radius
    this.sensor = this.addSensor()
  }

  destroy (): void {
    this.destroyed = true
    if (this.actor.stage.flags.meatY && this.combatDamage > 0) {
      const size = this.radius * Math.SQRT2
      const halfSize = size / 2
      this.actor.stage.addFoodSquare({
        nutrition: this.combatDamage,
        position: this.position,
        halfSize
      })
    }
    super.destroy()
  }

  doDamage (target: Feature): void {
    const combatDamage = this.getCombatDamage(target)
    target.combatDamage += combatDamage
    target.health = target.getHealth()
    if (target.health <= 0) {
      if (target instanceof Membrane) {
        const killing = new Killing({
          victim: target,
          stage: this.actor.stage,
          killer: this
        })
        this.actor.stage.killingQueue.push(killing)
      } else {
        target.actor.destroy()
      }
    }
  }

  getDamage (props: {
    target: Membrane
  }): number {
    const ratio = this.mass / props.target.mass
    const power = Math.pow(ratio, Membrane.DAMAGE_FACTOR)
    const damage = Membrane.BASE_DAMAGE * power
    return damage
  }

  getHealth (): number {
    const combatHealth = super.getHealth()
    const health = combatHealth - this.hungerDamage
    return health
  }

  getJaw (props: {
    target: Membrane
  }): number {
    const damage = this.getDamage({ target: props.target })
    const jaw = props.target.health / damage
    return jaw
  }

  handleContact (props: {
    target: Feature
  }): void {
    super.handleContact({ target: props.target })
    if (props.target.actor instanceof Food) {
      const nutrition = this.maximumHealth * props.target.actor.nutrition
      this.heal({ health: nutrition })
      props.target.actor.destroy()
    } else if (props.target.actor instanceof Tree) {
      props.target.actor.fall()
    } else if (props.target instanceof Membrane && props.target.actor.color !== this.actor.color) {
      this.doDamage(props.target)
      this.shove(props.target)
    } else if (props.target instanceof Prop) {
      this.doDamage(props.target)
    }
  }

  heal (props: { health: number }): void {
    let remaining = props.health
    if (this.hungerDamage > 0) {
      const minimum = Math.min(remaining, this.hungerDamage)
      remaining -= this.hungerDamage
      this.hungerDamage -= minimum
      if (remaining < 0) {
        return
      }
    }
    if (this.combatDamage > 0) {
      const minimum = Math.min(remaining, this.combatDamage)
      remaining -= this.combatDamage
      this.combatDamage -= minimum
      if (remaining < 0) {
        return
      }
    }
    this.actor.reproduce({ health: remaining })
  }

  hunger (): void {
    if (
      !this.actor.stage.flags.hungerY ||
      this.health <= 0 ||
      this.destroyed ||
      this.actor.dead
    ) {
      return
    }
    const genetic = Membrane.GENETIC_LIFE_SECONDS * this.actor.gene.stamina
    const lifeSeconds = Membrane.MINIMUM_LIFE_SECONDS + genetic
    const lifeFrames = Runner.FPS * lifeSeconds
    const hunger = 1 / lifeFrames
    this.hungerDamage += hunger
    this.health = this.getHealth()
    if (this.health > 0) {
      return
    }
    this.actor.starve({ membrane: this })
  }

  onStep (props: { stepSize: number }): void {
    super.onStep({ stepSize: props.stepSize })
    this.hunger()
  }

  shove (target: Membrane): void {
    const ratio = this.mass / target.mass
    const forceScale = 50 * ratio
    const direction = directionFromTo(this.body.getPosition(), target.body.getPosition())
    const force = Vec2.mul(direction, forceScale)
    target.body.applyForceToCenter(force)
  }
}
