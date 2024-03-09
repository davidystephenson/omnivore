import { AABB, Body, BodyDef, Fixture, FixtureDef, Vec2 } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { SIGHT } from '../../shared/sight'

export class Feature {
  body: Body
  fixture: Fixture
  force = Vec2(0, 0)
  label = 'default'
  actor: Actor
  id: number
  borderWidth: number
  color: Color
  borderColor: Color
  spawnPosition = Vec2(0, 0)
  deathPosition = Vec2(0, 0)
  health = 1

  constructor (props: {
    bodyDef: BodyDef
    fixtureDef: FixtureDef
    label?: string
    actor: Actor
    color: Color
    borderColor: Color
    borderWidth?: number
  }) {
    this.actor = props.actor
    this.body = this.actor.stage.world.createBody(props.bodyDef)
    this.body.setUserData(this)
    this.label = props.label ?? this.label
    this.fixture = this.body.createFixture(props.fixtureDef)
    this.fixture.setUserData(this)
    this.color = props.color
    this.borderColor = props.borderColor
    this.borderWidth = props.borderWidth ?? 0.1
    actorCount += 1
    this.id = actorCount
  }

  getFeaturesInRange (): Feature[] {
    const featuresInRange: Feature[] = []
    const position = this.body.getPosition()
    const upper = Vec2.add(position, SIGHT)
    const lower = Vec2.sub(position, SIGHT)
    const visionBox = new AABB(lower, upper)
    this.actor.stage.runner.getBodies().forEach(body => {
      const feature = body.getUserData() as Feature
      if (feature.label === 'barrier') {
        featuresInRange.push(feature)
      }
    })
    this.actor.stage.world.queryAABB(visionBox, fixture => {
      const feature = fixture.getUserData() as Feature
      if (feature.label === 'barrier') return true
      featuresInRange.push(feature)
      return true
    })
    return featuresInRange
  }

  getFeaturesInVision (): Feature[] {
    const featuresInVision: Feature[] = []
    const featuresInRange = this.getFeaturesInRange()
    const position = this.body.getPosition()
    featuresInRange.forEach(feature => {
      if (feature.label === 'barrier') {
        featuresInVision.push(feature)
        return
      }
      const featurePosition = feature.body.getPosition()
      let visible = true
      this.actor.stage.world.rayCast(position, featurePosition, (fixture, point, normal, fraction) => {
        const collideFeature = fixture.getUserData() as Feature
        const isTarget = collideFeature.id === feature.id
        const isMouth = collideFeature.label === 'mouth'
        if (isTarget || isMouth) return 1
        visible = false
        return 0
      })
      if (visible) featuresInVision.push(feature)
    })
    return featuresInVision
  }
}

let actorCount = 0
