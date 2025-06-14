import { Body, BodyDef, Box, Circle, Fixture, FixtureDef, Polygon, Vec2 } from 'planck'
import { Rgb, YELLOW } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Rope } from '../../shared/rope'
import { Element } from '../../shared/element'
import { roundNumber, roundVector } from '../math'
import { HALF_SIGHT_SIZE } from '../../shared/sight'

let featureCount = 0

export class Feature {
  static MINIMUM_DAMAGE = 0.00000001
  static DAMPING = 0.14
  actor: Actor
  body: Body
  borderWidth: number
  center: Vec2
  color: Rgb
  combatDamage: number
  contacts: Feature[] = []
  deathPosition = Vec2(0, 0)
  health: number
  id: number
  fixture: Fixture
  force = Vec2(0, 0)
  label = 'default'
  maximumHealth = 1
  position: Vec2
  polygon: {
    vertices: Vec2[]
  }

  radius: number
  ropes: Rope[] = []
  seed?: {
    vertices: Vec2[]
  }

  sensor?: Fixture
  sensorFeatures: Feature[] = []
  spawnPosition = Vec2(0, 0)

  constructor (props: {
    actor: Actor
    bodyDef: BodyDef
    borderWidth?: number
    color: Rgb
    fixtureDef: FixtureDef
    health?: number
    label?: string
  }) {
    this.label = props.label ?? this.label
    this.actor = props.actor
    this.health = this.maximumHealth
    this.body = this.actor.stage.world.createBody(props.bodyDef)
    this.position = this.body.getPosition()
    this.body.setUserData(this)
    this.fixture = this.body.createFixture(props.fixtureDef)
    this.combatDamage = props.health == null
      ? 0
      : this.maximumHealth - props.health
    this.fixture.setUserData(this)
    featureCount += 1
    this.id = featureCount
    const shape = this.fixture.getShape()
    const isCircle = shape instanceof Circle
    const isPolygon = shape instanceof Polygon
    this.center = isCircle ? shape.getCenter() : Vec2(0, 0)
    this.radius = isCircle ? shape.getRadius() : 0
    this.polygon = isPolygon
      ? { vertices: shape.m_vertices }
      : { vertices: [] }
    this.color = props.color
    this.borderWidth = props.borderWidth ?? 0.1
  }

  addSensor (): Fixture {
    this.sensor = this.body.createFixture({
      shape: Box(HALF_SIGHT_SIZE.x, HALF_SIGHT_SIZE.y),
      isSensor: true
    })
    this.sensor.setUserData(this)
    return this.sensor
  }

  dealDamage (props: {
    damage?: number
    target: Feature
    multiplier?: number
  }): void {
    this.actor.stage.flag({ f: 'damage', k: 'attacker', v: this.label })
    this.actor.stage.flag({
      f: 'damage', k: 'target', v: props.target.label
    })
    const damageDealt = props.damage ?? this.getDamageDealt({ multiplier: props.multiplier, target: props.target })
    this.actor.stage.flag({
      f: 'damage', k: 'damageDealt', v: damageDealt
    })
    if (damageDealt < Feature.MINIMUM_DAMAGE) {
      const message = `combatDamage < Feature.MINIMUM_DAMAGE: ${damageDealt}`
      throw new Error(message)
    }
    props.target.takeDamage({ damage: damageDealt, dealer: this })
  }

  destroy (): void {
    this.actor.stage.destructionQueue.push(this.body)
  }

  getDamageDealt (props: { multiplier?: number, target: Feature }): number {
    const multiplier = props.multiplier ?? 1
    this.actor.stage.flag({ f: 'damage', k: 'multiplier', v: multiplier })
    const myMass = this.body.getMass()
    this.actor.stage.flag({ f: 'damage', k: 'myMass', v: myMass })
    const multipliedMass = myMass * multiplier
    this.actor.stage.flag({ f: 'damage', k: 'multipliedMass', v: multipliedMass })
    const targetMass = props.target.body.getMass()
    this.actor.stage.flag({ f: 'damage', k: 'targetMass', v: targetMass })
    const ratio = multipliedMass / targetMass
    const factor = 3
    const combatDamage = 0.1 * Math.pow(ratio, factor)
    if (combatDamage < Feature.MINIMUM_DAMAGE) {
      return Feature.MINIMUM_DAMAGE
    }
    return combatDamage
  }

  getElement (seen: boolean): Element {
    const position = roundVector({ vector: this.position })
    const angle = this.body.getAngle()
    const n = roundNumber({ number: angle, decimals: 3 })
    const a = this.getHealth()
    const element: Element = {
      i: this.id,
      x: position.x,
      y: position.y,
      n,
      s: 1,
      a
    }
    element.u = this.radius
    if (!seen) {
      element.r = this.color.red
      element.g = this.color.green
      element.b = this.color.blue
      element.o = this.borderWidth
      if (this.radius > 0) {
        element.z = this.center.x
        element.w = this.center.y
      } else {
        element.v = this.polygon.vertices.map(vertex => {
          return roundVector({ vector: vertex })
        })
      }
      if (this.seed != null) {
        element.d = this.seed.vertices.map(vertex => {
          return roundVector({ vector: vertex })
        })
      }
    }
    return element
  }

  getFeaturesInRange (props?: {
    playing: boolean
  }): Feature[] {
    if (!this.actor.stage.flags.visionRangeGame && props?.playing === true) {
      return this.actor.stage.runner.features
    }
    const featuresInRange: Feature[] = []
    this.actor.stage.walls.forEach(wall => featuresInRange.push(wall.structure))
    this.actor.features.forEach(feature => featuresInRange.push(feature))
    this.sensorFeatures.forEach(feature => featuresInRange.push(feature))
    // this.actor.stage.actors.forEach(actor => {
    //   actor.features.forEach(feature => {
    //     if (feature.label === 'membrane') {
    //       featuresInRange.push(feature)
    //     }
    //   })
    // })
    return featuresInRange
  }

  getHealth (): number {
    const health = this.maximumHealth - this.combatDamage
    if (this.combatDamage < 0) {
      const message = `this.combatDamage < 0: ${this.combatDamage}`
      throw new Error(message)
    }
    return health
  }

  handleContact (props: {
    target: Feature
  }): void { }

  handleContacts (): void {
    this.contacts.forEach(target => {
      this.handleContact({ target })
    })
  }

  onStep (props: {
    stepSize: number
  }): void {
    this.health = this.getHealth()
    this.position = this.body.getPosition()
    this.handleContacts()
  }

  succumb (props: {
    killer?: Feature
  }): void {
    this.actor.destroy()
  }

  takeDamage (props: {
    debug?: boolean
    damage: number
    dealer?: Feature
  }): void {
    const debug = props.debug ?? false
    const oldHealth = this.getHealth()
    if (oldHealth > 1) {
      const message = `oldHealth > 1: ${oldHealth}`
      throw new Error(message)
    }
    this.combatDamage += props.damage
    this.health = this.getHealth()
    if (this.health > oldHealth - Feature.MINIMUM_DAMAGE + 0.001) {
      const message = `Invalid target.health: ${this.health} > ${oldHealth} - ${Feature.MINIMUM_DAMAGE}`
      throw new Error(message)
    }
    if (debug) {
      this.actor.stage.debugCircle({
        circle: new Circle(this.position, 0.6),
        color: YELLOW
      })
    }
    if (this.health <= 0) {
      this.succumb({ killer: props.dealer })
    }
  }
}
