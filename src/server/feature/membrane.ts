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
  static MINIMUM_LIFE_SECONDS = 10
  static GENETIC_LIFE_SECONDS = 300
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
    this.mass = this.body.getMass()
    this.radius = radius
    this.sensor = this.addSensor()
  }

  destroy (): void {
    this.destroyed = true
    const foodRatio = this.combatDamage / Food.NUTRITION
    const foodCount = Math.floor(foodRatio)
    for (let i = 0; i < foodCount; i++) {
      this.actor.stage.addFoodSquare({
        position: this.position
      })
    }
    super.destroy()
  }

  doDamage (target: Feature): void {
    const ratio = this.body.getMass() / target.body.getMass()
    const factor = 3
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

  handleContacts (): void {
    this.contacts.forEach(target => {
      if (target.actor instanceof Food) {
        const nutrition = this.maximumHealth * target.actor.nutrition
        this.heal({ value: nutrition })
        target.actor.destroy()
      } else if (target.actor instanceof Tree) {
        target.actor.fall()
      } else if (target instanceof Membrane && target.actor.color !== this.actor.color) {
        this.doDamage(target)
        this.shove(target)
      } else if (target instanceof Prop) {
        this.doDamage(target)
      }
    })
  }

  heal (props: { value: number }): void {
    if (this.hungerDamage >= 0) {
      this.hungerDamage -= props.value
    } else if (this.combatDamage > props.value) {
      this.combatDamage -= props.value
    } else {
      this.actor.reproduce()
    }
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
    this.handleContacts()
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
