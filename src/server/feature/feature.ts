import { AABB, Body, BodyDef, Fixture, FixtureDef, CircleShape, Vec2, PolygonShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
// import { DebugLine } from '../../shared/debugLine'
import { Rope } from '../../shared/rope'
import { DebugLine } from '../../shared/debugLine'
import { SIGHT } from '../../shared/sight'
import { directionFromTo, getNearestIndex, range, rotate } from '../math'
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
    /*
    this.actor.stage.runner.getBodies().forEach(body => {
      const feature = body.getUserData() as Feature
      if (feature.label === 'barrier') return
      // const featureAABB = feature.fixture.getAABB()
      featuresInRange.push(feature)
    })
    */
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
        red: 255,
        green: 0,
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

  checkCircleToCircle (fromFeature: Feature, toFeature: Feature, fromCircle: CircleShape, toCircle: CircleShape): Boolean {
    const myPosition = fromFeature.body.getPosition()
    const targetPosition = toFeature.body.getPosition()
    const lines: Line[] = [new Line({ a: myPosition, b: targetPosition })]
    const direction = directionFromTo(myPosition, targetPosition)
    const rightDirection = rotate(direction, 0.5 * Math.PI)
    const rightSelfPosition = Vec2.combine(1, myPosition, fromCircle.getRadius(), rightDirection)
    const rightTargetPosition = Vec2.combine(1, targetPosition, toCircle.getRadius(), rightDirection)
    lines.push(new Line({ a: rightSelfPosition, b: rightTargetPosition }))
    const leftDirection = rotate(direction, -0.5 * Math.PI)
    const leftSelfPosition = Vec2.combine(1, myPosition, fromCircle.getRadius(), leftDirection)
    const leftTargetPosition = Vec2.combine(1, targetPosition, toCircle.getRadius(), leftDirection)
    lines.push(new Line({ a: leftSelfPosition, b: leftTargetPosition }))
    return lines.some(line => this.isClear(line.a, line.b, toFeature.id))
  }

  checkCircleToPolygon (fromFeature: Feature, toFeature: Feature, fromCircle: CircleShape, toPolygon: PolygonShape): Boolean {
    const lines: Line[] = []
    const fromCenterPosition = fromFeature.body.getPosition()
    const toCenterPosition = toFeature.body.getPosition()
    const toVertices = toPolygon.m_vertices.map(vertex => Vec2.add(toCenterPosition, vertex))
    const nearestIndex = getNearestIndex(fromCenterPosition, toVertices)
    const toPositions = [
      toVertices[nearestIndex > 0 ? nearestIndex - 1 : toVertices.length - 1],
      toVertices[nearestIndex],
      toVertices[nearestIndex < toVertices.length - 1 ? nearestIndex + 1 : 0]
    ]
    range(0, 1).forEach(i => {
      const j = i + 1
      const point1 = toPositions[i]
      lines.push(new Line({ a: fromCenterPosition, b: point1 }))
      const point2 = toPositions[j]
      const distance = Vec2.distance(point1, point2)
      if (distance <= 0.6) return false
      const segmentCount = Math.ceil(distance / 0.6)
      const segmentLength = distance / segmentCount
      const segmentDirection = directionFromTo(point1, point2)
      range(0, segmentCount - 1).forEach(i => {
        const toPosition = Vec2.combine(1, point1, i * segmentLength, segmentDirection)
        const direction = directionFromTo(fromCenterPosition, toPosition)
        const rightDirection = rotate(direction, 0.5 * Math.PI)
        const leftDirection = rotate(direction, -0.5 * Math.PI)
        const fromRightPosition = Vec2.combine(1, fromCenterPosition, fromCircle.getRadius(), rightDirection)
        const fromLeftPosition = Vec2.combine(1, fromCenterPosition, fromCircle.getRadius(), leftDirection)
        lines.push(new Line({ a: fromCenterPosition, b: toPosition }))
        lines.push(new Line({ a: fromRightPosition, b: toPosition }))
        lines.push(new Line({ a: fromLeftPosition, b: toPosition }))
      })
    })
    lines.forEach(line => { this.isClear(line.a, line.b, toFeature.id) })
    return lines.some(line => this.isClear(line.a, line.b, toFeature.id))
  }

  checkPolygonToPolygon (fromFeature: Feature, toFeature: Feature, fromPolygon: PolygonShape, toPolygon: PolygonShape): Boolean {
    const lines: Line[] = []
    const fromCenterPosition = fromFeature.body.getPosition()
    const fromPoints = fromPolygon.m_vertices.map(vertex => Vec2.add(fromCenterPosition, vertex))
    const toCenterPosition = toFeature.body.getPosition()
    const toPoints = toPolygon.m_vertices.map(vertex => Vec2.add(toCenterPosition, vertex))
    range(0, fromPoints.length - 1).forEach(i => {
      const j = (i + 1) % fromPoints.length
      const point1 = fromPoints[i]
      const point2 = fromPoints[j]
      const distance = Vec2.distance(point1, point2)
      if (distance <= 0.6) return false
      const segmentCount = Math.ceil(distance / 0.6)
      const segmentLength = distance / segmentCount
      const segmentDirection = directionFromTo(point1, point2)
      range(0, segmentCount - 1).forEach(i => {
        const intermediatePoint = Vec2.combine(1, point1, i * segmentLength, segmentDirection)
        fromPoints.push(intermediatePoint)
      })
    })
    range(0, toPoints.length - 1).forEach(i => {
      const j = (i + 1) % toPoints.length
      const point1 = toPoints[i]
      const point2 = toPoints[j]
      const distance = Vec2.distance(point1, point2)
      if (distance <= 0.6) return false
      const segmentCount = Math.ceil(distance / 0.6)
      const segmentLength = distance / segmentCount
      const segmentDirection = directionFromTo(point1, point2)
      range(0, segmentCount - 1).forEach(i => {
        const intermediatePoint = Vec2.combine(1, point1, i * segmentLength, segmentDirection)
        toPoints.push(intermediatePoint)
      })
    })
    fromPoints.forEach(fromPoint => {
      toPoints.forEach(toPoint => {
        lines.push(new Line({ a: fromPoint, b: toPoint }))
      })
    })
    return lines.some(line => this.isClear(line.a, line.b, toFeature.id))
  }

  isFeatureVisible (targetFeature: Feature): Boolean {
    if (targetFeature.label === 'barrier') {
      return true
    }
    if (targetFeature.actor.id === this.actor.id) return true
    const myShape = this.fixture.getShape()
    const targetShape = targetFeature.fixture.getShape()
    if (myShape instanceof CircleShape && targetShape instanceof CircleShape) {
      return this.checkCircleToCircle(this, targetFeature, myShape, targetShape)
    }
    if (myShape instanceof CircleShape && targetShape instanceof PolygonShape) {
      return this.checkCircleToPolygon(this, targetFeature, myShape, targetShape)
    }
    if (myShape instanceof PolygonShape && targetShape instanceof PolygonShape) {
      return this.checkPolygonToPolygon(this, targetFeature, myShape, targetShape)
    }
    return true
  }
}
