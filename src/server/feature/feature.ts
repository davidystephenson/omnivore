import { Body, BodyDef, Fixture, FixtureDef, Vec2 } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
// import { DebugLine } from '../../shared/debugLine'
import { Rope } from '../../shared/rope'

let featureCount = 0

export class Feature {
  body: Body
  fixture: Fixture
  force = Vec2(0, 0)
  label = 'default'
  actor: Actor
  id: number
  borderWidth: number
  color: Color
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
    this.color = props.color
    this.borderWidth = props.borderWidth ?? 0.1
    featureCount += 1
    this.id = featureCount
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

  onStep (): void {}
}
