import { Body, BodyDef, Box, Circle, Fixture, FixtureDef, Polygon, Vec2 } from 'planck'
import { Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Rope } from '../../shared/rope'
import { Element } from '../../shared/element'
import { roundNumber, roundVector } from '../math'
import { HALF_SIGHT } from '../../shared/sight'

let featureCount = 0

export class Feature {
  body: Body
  id: number
  fixture: Fixture
  force = Vec2(0, 0)
  label = 'default'
  actor: Actor
  ropes: Rope[] = []
  spawnPosition = Vec2(0, 0)
  deathPosition = Vec2(0, 0)
  health = 1
  maximumHealth = 1
  sensorFeatures: Feature[] = []
  contacts: Feature[] = []
  color: Rgb
  borderWidth: number
  center: Vec2
  radius: number
  sensor?: Fixture
  polygon: {
    vertices: Vec2[]
  }

  seed?: {
    vertices: Vec2[]
  }

  constructor (props: {
    bodyDef: BodyDef
    fixtureDef: FixtureDef
    label?: string
    actor: Actor
    color: Rgb
    borderWidth?: number
  }) {
    this.actor = props.actor
    this.body = this.actor.stage.world.createBody(props.bodyDef)
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
    const position = roundVector(this.body.getPosition())
    const element: Element = {
      i: this.id,
      x: position.x,
      y: position.y,
      n: roundNumber(this.body.getAngle()),
      s: 1,
      a: this.health
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
          return roundVector(vertex)
        })
      }
      if (this.seed != null) {
        element.d = this.seed.vertices.map(vertex => {
          return roundVector(vertex)
        })
      }
    }
    return element
  }

  onStep (stepSize: number): void {}
}
