import { Body, BodyDef, Circle, Fixture, FixtureDef, Polygon, Vec2 } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Rope } from '../../shared/rope'
import { Element } from '../../shared/element'

let featureCount = 0

export class Feature {
  body: Body
  id: number
  fixture: Fixture
  element: Element
  force = Vec2(0, 0)
  label = 'default'
  actor: Actor
  ropes: Rope[] = []
  spawnPosition = Vec2(0, 0)
  deathPosition = Vec2(0, 0)
  health = 1
  maximumHealth = 1
  radius = 0
  sensorFeatures: Feature[] = []
  contacts: Feature[] = []

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
    const circle = {
      center: isCircle ? shape.getCenter() : Vec2(0, 0),
      radius: isCircle ? shape.getRadius() : 0
    }
    const polygon = {
      vertices: isPolygon ? shape.m_vertices : []
    }
    this.element = {
      visible: true,
      position: this.body.getPosition(),
      angle: this.body.getAngle(),
      id: featureCount,
      color: props.color,
      borderWidth: props.borderWidth ?? 0.1,
      circle: isCircle ? circle : undefined,
      polygon: isPolygon ? polygon : undefined
    }
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

  onStep (stepSize: number): void {}
}
