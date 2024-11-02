import { Body, BodyDef, Circle, Fixture, FixtureDef, Polygon, Vec2 } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Rope } from '../../shared/rope'
import { Element } from '../../shared/element'
import { roundVector } from '../math'

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
  color: Color
  borderWidth: number
  center: Vec2
  radius: number
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
    color: Color
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

  getFeaturesInRange (): Feature[] {
    const featuresInRange: Feature[] = []
    this.actor.stage.walls.forEach(wall => featuresInRange.push(wall.structure))
    this.actor.features.forEach(feature => featuresInRange.push(feature))
    this.sensorFeatures.forEach(feature => featuresInRange.push(feature))
    return featuresInRange
  }

  destroy (): void {
    this.actor.stage.actors.delete(this.actor.id)
    this.actor.stage.destructionQueue.push(this.body)
  }

  getElement (seen: boolean): Element {
    const element: Element = {
      id: this.id,
      position: roundVector(this.body.getPosition()),
      angle: Number(this.body.getAngle().toFixed(4)),
      scale: 1,
      alpha: this.color.alpha
    }
    if (!seen) {
      element.color = this.color
      element.borderWidth = this.borderWidth
      if (this.radius > 0) {
        element.circle = {
          center: this.center,
          radius: this.radius
        }
      } else {
        const vertices = this.polygon.vertices.map(vertex => {
          return roundVector(vertex)
        })
        element.polygon = { vertices }
      }
      if (this.seed != null) {
        const vertices = this.seed.vertices.map(vertex => {
          return roundVector(vertex)
        })
        element.seed = { vertices }
      }
    }
    return element
  }

  onStep (stepSize: number): void {}
}
