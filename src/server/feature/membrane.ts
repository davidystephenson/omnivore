import { Vec2, Circle, Fixture } from 'planck'
import { Feature } from './feature'
import { Organism } from '../actor/organism'
import { Killing } from '../death/killing'
import { directionFromTo } from '../math'
import { Tree } from '../actor/tree'
import { Food } from '../actor/food'
import { Runner } from '../runner'
import { Prop } from './prop'
import { Debris } from '../actor/debris'
import { SIGHT } from '../../shared/sight'
import { LIME } from '../../shared/color'

export class Membrane extends Feature {
  static BASE_DAMAGE = 0.1
  static DAMAGE_FACTOR = 3
  static GENETIC_LIFE_SECONDS = 100
  static GROWTH = 0.01
  static INITIAL_RADIUS = 0.6 / Math.sqrt(2)
  static MINIMUM_DAMAGE = 0.1
  static MINIMUM_LIFE_SECONDS = 40
  actor: Organism
  destroyed = false
  hungerDamage = 0
  collideFeatures = new Set<Feature>()
  mass: number
  targetRadius: number
  radius: number
  sensor: Fixture
  step = 0

  constructor (props: {
    position: Vec2
    actor: Organism
    radius?: number
  }) {
    const radius = props.radius ?? 1
    const startRadius = props.actor.stage.flags.growGame ? Membrane.INITIAL_RADIUS : radius
    super({
      bodyDef: {
        type: 'dynamic',
        position: props.position,
        bullet: true,
        fixedRotation: true,
        linearDamping: Feature.DAMPING
      },
      fixtureDef: {
        shape: new Circle(Vec2(0, 0), startRadius),
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
    this.radius = startRadius
    this.targetRadius = radius
    this.sensor = this.addSensor()
  }

  damageLog (props: {
    k: string
    v: string | number
  }): void {
    this.actor.stage.flag({ f: 'damage', k: props.k, seconds: 1, v: props.v })
  }

  destroy (): void {
    this.destroyed = true
    if (this.actor.stage.flags.meatGame && this.combatDamage > 0) {
      const size = this.radius * Math.SQRT2
      const halfSize = size / 2
      this.actor.stage.addFoodSquare({
        color: LIME,
        nutrition: this.combatDamage * 0.5,
        position: this.position,
        halfSize
      })
    }
    super.destroy()
  }

  getDamageDealt (props: { target: Feature }): number {
    if (props.target.actor instanceof Debris) {
      const fixture = props.target.body.getFixtureList()
      if (fixture == null) {
        throw new Error('fixture is null')
      }
      const area = props.target.actor.getArea()
      this.damageLog({ k: 'area', v: area })
      this.damageLog({ k: 'SIGHT.width', v: SIGHT.width })
      const sightArea = SIGHT.width * SIGHT.height
      this.damageLog({ k: 'sightArea', v: sightArea })
      const ratio = area / sightArea
      this.damageLog({ k: 'ratio', v: ratio })
      const reversed = 1 - ratio
      this.damageLog({ k: 'reversed', v: reversed })
      this.damageLog({ k: 'strength', v: this.actor.gene.strength })
      const baseDamage = Math.pow(this.actor.gene.strength, 10) * 0.01
      this.damageLog({ k: 'baseDamage', v: baseDamage })
      const strengthDamage = baseDamage * Math.pow(reversed, 100)
      this.damageLog({ k: 'strengthDamage', v: strengthDamage })
      const sizeFactor = Math.pow(reversed, 1000)
      this.damageLog({ k: 'sizeFactor', v: sizeFactor })
      const sizeDamage = 0.1 * sizeFactor
      this.damageLog({ k: 'sizeDamage', v: sizeDamage })
      const damage = strengthDamage + sizeDamage
      this.damageLog({ k: 'damage', v: damage })

      if (damage < Feature.MINIMUM_DAMAGE) {
        return Feature.MINIMUM_DAMAGE
      }
      return damage
    }
    const damage = super.getDamageDealt({ target: props.target })
    if (props.target instanceof Membrane && damage < Membrane.MINIMUM_DAMAGE) {
      return Membrane.MINIMUM_DAMAGE
    }
    return damage
  }

  getHealth (): number {
    const combatHealth = super.getHealth()
    if (this.hungerDamage < 0) {
      const message = `hungerDamage < 0: ${this.hungerDamage}`
      throw new Error(message)
    }
    const health = combatHealth - this.hungerDamage
    return health
  }

  getJaw (props: {
    target: Membrane
  }): number {
    const damage = this.getDamageDealt({ target: props.target })
    const jaw = props.target.health / damage
    return jaw
  }

  grow (stepSize: number): void {
    if (this.radius === this.targetRadius) return
    this.step += 1
    if (this.step % 2 === 0) {
      const increase = Membrane.GROWTH * stepSize * this.radius
      this.radius = Math.min(this.radius + increase, this.targetRadius)
      this.body.destroyFixture(this.fixture)
      this.fixture = this.body.createFixture({
        shape: new Circle(Vec2(0, 0), this.radius),
        density: 1,
        restitution: 0,
        friction: 0
      })
    }
    this.body.setUserData(this)
    this.fixture.setUserData(this)
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
      this.dealDamage({ target: props.target })
      this.shove(props.target)
    } else if (props.target instanceof Prop) {
      this.dealDamage({ target: props.target })
    }
  }

  heal (props: { health: number }): void {
    let remaining = props.health
    if (this.hungerDamage > 0) {
      const minimum = Math.min(remaining, this.hungerDamage)
      remaining -= this.hungerDamage
      this.hungerDamage -= minimum
      if (this.hungerDamage < 0) {
        const message = `heal hungerDamage < 0: ${this.hungerDamage}`
        throw new Error(message)
      }
    }
    if (remaining < 0) {
      return
    }
    if (this.combatDamage > 0) {
      const minimum = Math.min(remaining, this.combatDamage)
      remaining -= this.combatDamage
      this.combatDamage -= minimum
      if (this.combatDamage < 0) {
        const message = `heal combatDamage < 0: ${this.combatDamage}`
        throw new Error(message)
      }
    }
    if (remaining < 0) {
      return
    }
    this.actor.reproduce({ health: remaining })
  }

  hunger (): void {
    if (
      !this.actor.stage.flags.hungerGame ||
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
    this.collideFeatures = new Set<Feature>()
  }

  shove (target: Membrane): void {
    const ratio = this.mass / target.mass
    const forceScale = 50 * ratio
    const direction = directionFromTo(this.body.getPosition(), target.body.getPosition())
    const force = Vec2.mul(direction, forceScale)
    target.body.applyForceToCenter(force)
  }

  succumb (props: {
    killer?: Membrane
  }): void {
    if (props.killer == null) {
      const message = 'killer is null'
      throw new Error(message)
    }
    const killing = new Killing({
      victim: this,
      stage: this.actor.stage,
      killer: props.killer
    })
    if (this.actor.stage.flags.playerDeath && this.actor.player != null) {
      console.debug('killingQueue before', this.actor.stage.killingQueue.length, new Date().toLocaleTimeString())
    }
    this.actor.stage.killingQueue.push(killing)
    if (this.actor.stage.flags.playerDeath && this.actor.player != null) {
      console.debug('killingQueue after', this.actor.stage.killingQueue.length, new Date().toLocaleTimeString())
    }
  }
}
