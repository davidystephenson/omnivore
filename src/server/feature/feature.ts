import { AABB, Body, BodyDef, Fixture, FixtureDef, Vec2 } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
import { SIGHT } from '../../shared/sight'
// import { DebugLine } from '../../shared/debugLine'
import { Rope } from '../../shared/rope'

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

  isPointInRange (point: Vec2): boolean {
    const position = this.body.getPosition()
    const upper = Vec2.add(position, SIGHT)
    const lower = Vec2.sub(position, SIGHT)
    const xInside = lower.x <= point.x && point.x <= upper.x
    const yInside = lower.y <= point.y && point.x <= upper.y
    return xInside && yInside
  }

  isPointVisble (point: Vec2): boolean {
    if (!this.isPointInRange(point)) return false
    const position = this.body.getPosition()
    let visible = true
    this.actor.stage.world.rayCast(position, point, (fixture, point, normal, fraction) => {
      const collideFeature = fixture.getUserData() as Feature
      const isMouth = collideFeature.label === 'mouth'
      if (isMouth) return 1
      visible = false
      return 0
    })
    return visible
  }

  getFeaturesInVision (): Feature[] {
    const featuresInRange = this.getFeaturesInRange()
    const featuresInVision = featuresInRange.filter(feature => {
      if (feature.label === 'barrier') {
        return true
      }
      if (feature.actor.id === this.actor.id) return true
      const featurePosition = feature.body.getPosition()
      const position = this.body.getPosition()
      let visible = true
      this.actor.stage.world.rayCast(position, featurePosition, (fixture, point, normal, fraction) => {
        const collideFeature = fixture.getUserData() as Feature
        const isTarget = collideFeature.id === feature.id
        const isMouth = collideFeature.label === 'mouth'
        if (isTarget || isMouth) return 1
        visible = false
        return 0
      })
      // const color = visible ? new Color({ red: 0, green: 255, blue: 0 }) : new Color({ red: 255, green: 0, blue: 0 })
      // const debugLine = new DebugLine({ anchorA: position, anchorB: featurePosition, color })
      // this.actor.stage.runner.debugLines.push(debugLine)
      if (visible) return true
      return false
    })
    return featuresInVision
  }
}

let actorCount = 0
