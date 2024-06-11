import { AABB, Body, BodyDef, Fixture, FixtureDef, CircleShape, Vec2, PolygonShape } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'
// import { DebugLine } from '../../shared/debugLine'
import { Rope } from '../../shared/rope'
import { SIGHT } from '../../shared/sight'
import { directionFromTo, getNearestIndex, range, rotate } from '../math'
import { LineFigure } from '../../shared/lineFigure'

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
  radius = 0

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
    let clear = true
    this.actor.stage.world.rayCast(startPoint, targetPoint, (fixture, point, normal, fraction) => {
      const collideFeature = fixture.getUserData() as Feature
      const isTarget = collideFeature.id === targetId
      const isMouth = collideFeature.label === 'mouth' || collideFeature.label === 'egg'
      if (isTarget || isMouth) return 1
      clear = false
      return 0
    })
    if (debug === true) {
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
      this.actor.stage.debugLine({
        a: startPoint,
        b: targetPoint,
        color
      })
    }
    return clear
  }

  isVisible (startPoint: Vec2, targetPoint: Vec2, targetId?: number, debug?: boolean): boolean {
    const inRange = this.isPointInRange(targetPoint)
    if (!inRange) return false
    const clear = this.isClear(startPoint, targetPoint, targetId, debug)
    return clear
  }

  checkCircleToCircle (fromFeature: Feature, toFeature: Feature, fromCircle: CircleShape, toCircle: CircleShape): boolean {
    const myPosition = fromFeature.body.getPosition()
    const targetPosition = toFeature.body.getPosition()
    const lines: LineFigure[] = [new LineFigure({ a: myPosition, b: targetPosition })]
    const direction = directionFromTo(myPosition, targetPosition)
    const rightDirection = rotate(direction, 0.5 * Math.PI)
    const rightSelfPosition = Vec2.combine(1, myPosition, fromCircle.getRadius(), rightDirection)
    const rightTargetPosition = Vec2.combine(1, targetPosition, toCircle.getRadius(), rightDirection)
    lines.push(new LineFigure({ a: rightSelfPosition, b: rightTargetPosition }))
    const leftDirection = rotate(direction, -0.5 * Math.PI)
    const leftSelfPosition = Vec2.combine(1, myPosition, fromCircle.getRadius(), leftDirection)
    const leftTargetPosition = Vec2.combine(1, targetPosition, toCircle.getRadius(), leftDirection)
    lines.push(new LineFigure({ a: leftSelfPosition, b: leftTargetPosition }))
    return lines.some(line => this.isVisible(line.a, line.b, toFeature.id))
  }

  checkCircleToPolygon (fromFeature: Feature, toFeature: Feature, fromCircle: CircleShape, toPolygon: PolygonShape): boolean {
    const lines: LineFigure[] = []
    const globalFromCenter = fromFeature.body.getPosition()
    const localFromCenter = toFeature.body.getLocalPoint(globalFromCenter)
    const radius = fromCircle.getRadius()
    const toVisibleCorners = toPolygon.m_vertices.filter(vertex => {
      const y = Math.sign(vertex.y) * localFromCenter.y + radius
      const x = Math.sign(vertex.x) * localFromCenter.x + radius
      const visibleY = y >= Math.abs(vertex.y)
      const visibleX = x >= Math.abs(vertex.x)
      return visibleX || visibleY
    }).map(vertex => {
      return toFeature.body.getWorldPoint(vertex)
    })
    function getCorners (): Vec2[] {
      if (toVisibleCorners.length < 3) return toVisibleCorners
      if (toVisibleCorners.length === 3) {
        const nearestFromIndex = getNearestIndex(globalFromCenter, toVisibleCorners)
        if (nearestFromIndex === 0) {
          return [toVisibleCorners[1], toVisibleCorners[0], toVisibleCorners[2]]
        }
        if (nearestFromIndex === 1) return toVisibleCorners
        if (nearestFromIndex === 2) {
          return [toVisibleCorners[0], toVisibleCorners[2], toVisibleCorners[1]]
        }
        throw new Error(`Invalid nearestFromIndex: ${nearestFromIndex}`)
      }
      const midpoints = range(0, 2).map(i => {
        const point1 = toVisibleCorners[i]
        const point2 = toVisibleCorners[i + 1]
        return Vec2.combine(0.5, point1, 0.5, point2)
      })
      const nearestMidpointIndex = getNearestIndex(globalFromCenter, midpoints)
      if (nearestMidpointIndex === 0) {
        const indices = [3, 0, 1, 2]
        return indices.map(i => toVisibleCorners[i])
      }
      if (nearestMidpointIndex === 1) {
        const indices = [0, 1, 2, 3]
        return indices.map(i => toVisibleCorners[i])
      }
      if (nearestMidpointIndex === 2) {
        const indices = [1, 2, 3, 0]
        return indices.map(i => toVisibleCorners[i])
      }
      const indices = [2, 3, 0, 1]
      return indices.map(i => toVisibleCorners[i])
    }
    const corners = getCorners()
    const spacing = 1 // 0.6
    range(0, corners.length - 2).forEach(i => {
      const j = i + 1
      const point1 = corners[i]
      lines.push(new LineFigure({ a: globalFromCenter, b: point1 }))
      const point2 = corners[j]
      const distance = Vec2.distance(point1, point2)
      if (distance <= spacing) return false
      const segmentCount = Math.ceil(distance / spacing)
      const segmentLength = distance / segmentCount
      const segmentDirection = directionFromTo(point1, point2)
      range(0, segmentCount).forEach(i => {
        const toPosition = Vec2.combine(1, point1, i * segmentLength, segmentDirection)
        const direction = directionFromTo(globalFromCenter, toPosition)
        const rightDirection = rotate(direction, 0.5 * Math.PI)
        const leftDirection = rotate(direction, -0.5 * Math.PI)
        const fromRightPosition = Vec2.combine(1, globalFromCenter, fromCircle.getRadius(), rightDirection)
        const fromLeftPosition = Vec2.combine(1, globalFromCenter, fromCircle.getRadius(), leftDirection)
        lines.push(new LineFigure({ a: globalFromCenter, b: toPosition }))
        lines.push(new LineFigure({ a: fromRightPosition, b: toPosition }))
        lines.push(new LineFigure({ a: fromLeftPosition, b: toPosition }))
      })
    })
    return lines.some(line => this.isVisible(line.a, line.b, toFeature.id))
  }

  checkPolygonToPolygon (fromFeature: Feature, toFeature: Feature, fromPolygon: PolygonShape, toPolygon: PolygonShape): boolean {
    const lines: LineFigure[] = []
    const fromCenterPosition = fromFeature.body.getPosition()
    const fromPoints = fromPolygon.m_vertices.map(vertex => {
      return fromFeature.body.getWorldPoint(vertex)
    })
    const toCenterPosition = toFeature.body.getPosition()
    const toPoints = toPolygon.m_vertices.map(vertex => {
      return toFeature.body.getWorldPoint(vertex)
    })
    const nearestFromIndex = getNearestIndex(toCenterPosition, fromPoints)
    const fromPositions = [
      fromPoints[nearestFromIndex > 0 ? nearestFromIndex - 1 : toPoints.length - 1],
      fromPoints[nearestFromIndex],
      fromPoints[nearestFromIndex < toPoints.length - 1 ? nearestFromIndex + 1 : 0]
    ]
    const nearestToIndex = getNearestIndex(fromCenterPosition, toPoints)
    const toPositions = [
      toPoints[nearestToIndex > 0 ? nearestToIndex - 1 : toPoints.length - 1],
      toPoints[nearestToIndex],
      toPoints[nearestToIndex < toPoints.length - 1 ? nearestToIndex + 1 : 0]
    ]
    const spacing = 5 // 0.6
    range(0, 1).forEach(i => {
      const j = i + 1
      const point1 = fromPositions[i]
      const point2 = fromPositions[j]
      const distance = Vec2.distance(point1, point2)
      if (distance <= spacing) return false
      const segmentCount = Math.ceil(distance / spacing)
      const segmentLength = distance / segmentCount
      const segmentDirection = directionFromTo(point1, point2)
      range(0, segmentCount - 1).forEach(i => {
        const intermediatePoint = Vec2.combine(1, point1, i * segmentLength, segmentDirection)
        fromPositions.push(intermediatePoint)
      })
    })
    /*
    range(0, 1).forEach(i => {
      const j = (i + 1) % toPoints.length
      const point1 = toPositions[i]
      const point2 = toPositions[j]
      const distance = Vec2.distance(point1, point2)
      if (distance <= spacing) return false
      const segmentCount = Math.ceil(distance / spacing)
      const segmentLength = distance / segmentCount
      const segmentDirection = directionFromTo(point1, point2)
      range(0, segmentCount - 1).forEach(i => {
        const intermediatePoint = Vec2.combine(1, point1, i * segmentLength, segmentDirection)
        toPositions.push(intermediatePoint)
      })
    })
    */
    fromPositions.forEach(fromPoint => {
      toPositions.forEach(toPoint => {
        lines.push(new LineFigure({ a: fromPoint, b: toPoint }))
      })
    })
    lines.forEach(line => this.isVisible(line.a, line.b, toFeature.id))
    return lines.some(line => this.isVisible(line.a, line.b, toFeature.id))
  }

  isFeatureVisible (targetFeature: Feature): boolean {
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
    return true
  }

  onStep (): void {}
}
