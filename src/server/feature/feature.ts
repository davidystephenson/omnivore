import { AABB, Body, BodyDef, Fixture, FixtureDef, Vec2 } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
// import { DebugLine } from '../../shared/debugLine'
import { Rope } from '../../shared/rope'
import { DebugLine } from '../../shared/debugLine'
import { SIGHT } from '../../shared/sight'
import { directionFromTo, rotate } from '../math'
import { Mouth } from './mouth'
import { Line } from '../../shared/line'

let actorCount = 0

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

  isClear (startPoint: Vec2, targetPoint: Vec2, targetId?: number, debug?: boolean): boolean {
    if (!this.isPointInRange(targetPoint)) return false
    let clear = true
    this.actor.stage.world.rayCast(startPoint, targetPoint, (fixture, point, normal, fraction) => {
      const collideFeature = fixture.getUserData() as Feature
      const isTarget = collideFeature.id === targetId
      const isMouth = collideFeature.label === 'mouth'
      if (isTarget || isMouth) return 1
      clear = false
      return 0
    })
    const color = clear
      ? new Color({
        red: 0,
        green: 255,
        blue: 0
      })
      : new Color({
        red: 0,
        green: 255,
        blue: 0
      })
    void new DebugLine({
      a: startPoint,
      b: targetPoint,
      color,
      stage: this.actor.stage
    })
    return clear
  }

  isFeatureVisible (targetFeature: Feature): Boolean {
    const selfPosition = this.body.getPosition()
    if (targetFeature.label === 'barrier') {
      return true
    }
    if (targetFeature.actor.id === this.actor.id) return true
    const targetPosition = targetFeature.body.getPosition()
    const lines: Line[] = [new Line({ a: selfPosition, b: targetPosition })]
    if (this instanceof Mouth && targetFeature instanceof Mouth) {
      const direction = directionFromTo(selfPosition, targetPosition)
      const rightDirection = rotate(direction, 0.5 * Math.PI)
      const rightSelfPosition = Vec2.combine(1, selfPosition, this.radius, rightDirection)
      const rightTargetPosition = Vec2.combine(1, targetPosition, targetFeature.radius, rightDirection)
      lines.push(new Line({ a: rightSelfPosition, b: rightTargetPosition }))
      const leftDirection = rotate(direction, -0.5 * Math.PI)
      const leftSelfPosition = Vec2.combine(1, selfPosition, this.radius, leftDirection)
      const leftTargetPosition = Vec2.combine(1, targetPosition, targetFeature.radius, leftDirection)
      lines.push(new Line({ a: leftSelfPosition, b: leftTargetPosition }))
    }
    return lines.some(line => this.isClear(line.a, line.b, targetFeature.id))
  }
}
