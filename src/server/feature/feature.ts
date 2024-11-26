import { Body, BodyDef, Box, Circle, Fixture, FixtureDef, Polygon, Vec2 } from 'planck'
import { Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Rope } from '../../shared/rope'
import { Element } from '../../shared/element'
import { roundNumber, roundVector } from '../math'
import { HALF_SIGHT } from '../../shared/sight'

let featureCount = 0

export class Feature {
  actor: Actor
  body: Body
  borderWidth: number
  center: Vec2
  color: Rgb
  combatDamage = 0
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
    bodyDef: BodyDef
    fixtureDef: FixtureDef
    label?: string
    actor: Actor
    color: Rgb
    borderWidth?: number
  }) {
    this.actor = props.actor
    this.health = this.maximumHealth
    this.body = this.actor.stage.world.createBody(props.bodyDef)
    this.position = this.body.getPosition()
    this.body.setUserData(this)
    this.label = props.label ?? this.label
    this.fixture = this.body.createFixture(props.fixtureDef)
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
      shape: Box(HALF_SIGHT.x, HALF_SIGHT.y),
      isSensor: true
    })
    this.sensor.setUserData(this)
    return this.sensor
  }

  getFeaturesInRange (): Feature[] {
    if (!this.actor.stage.flags.visionRangeY) {
      return this.actor.stage.runner.features
    }
    const featuresInRange: Feature[] = []
    this.actor.stage.walls.forEach(wall => featuresInRange.push(wall.structure))
    this.actor.features.forEach(feature => featuresInRange.push(feature))
    this.sensorFeatures.forEach(feature => featuresInRange.push(feature))
    return featuresInRange
  }

  destroy (): void {
    this.actor.stage.destructionQueue.push(this.body)
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
    if (!seen) {
      element.r = this.color.red
      element.g = this.color.green
      element.b = this.color.blue
      element.o = this.borderWidth
      if (this.radius > 0) {
        element.z = this.center.x
        element.w = this.center.y
        element.u = this.radius
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

  getHealth (): number {
    const health = this.maximumHealth - this.combatDamage
    return health
  }

  onStep (props: {
    stepSize: number
  }): void {
    this.health = this.getHealth()
    this.position = this.body.getPosition()
  }
}
