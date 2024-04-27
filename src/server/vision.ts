
import { SIGHT } from '../shared/sight'
import { Feature } from './feature/feature'
import { Vec2, AABB, CircleShape, PolygonShape } from 'planck'
import { Stage } from './stage'
import { Color } from '../shared/color'
import { getNearestIndex, normalize, rotate } from './math'

export class Vision {
  stage: Stage

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  static getFeaturesInRange (source: Feature): Feature[] {
    const featuresInRange: Feature[] = []
    const position = source.body.getPosition()
    const upper = Vec2.add(position, SIGHT)
    const lower = Vec2.sub(position, SIGHT)
    const visionBox = new AABB(lower, upper)
    source.actor.stage.runner.getBodies().forEach(body => {
      const feature = body.getUserData() as Feature
      if (feature.label === 'barrier') {
        featuresInRange.push(feature)
      }
    })
    source.actor.stage.world.queryAABB(visionBox, fixture => {
      const feature = fixture.getUserData() as Feature
      if (feature.label === 'barrier') return true
      featuresInRange.push(feature)
      return true
    })
    return featuresInRange
  }

  isPointInRange (sourcePoint: Vec2, targetPoint: Vec2): boolean {
    const upper = Vec2.add(sourcePoint, SIGHT)
    const lower = Vec2.sub(sourcePoint, SIGHT)
    const xInside = lower.x <= targetPoint.x && targetPoint.x <= upper.x
    const yInside = lower.y <= targetPoint.y && targetPoint.x <= upper.y
    return xInside && yInside
  }

  isClear (startPoint: Vec2, targetPoint: Vec2, excludeId?: number, debug?: boolean): boolean {
    let clear = true
    this.stage.world.rayCast(startPoint, targetPoint, (fixture, point, normal, fraction) => {
      const collideFeature = fixture.getUserData() as Feature
      const excluded = collideFeature.id === excludeId
      const isMouth = collideFeature.label === 'mouth' || collideFeature.label === 'egg'
      if (excluded || isMouth) return 1
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
    this.stage.addDebugLine({
      a: startPoint,
      b: targetPoint,
      color
    })
    return clear
  }

  isVisible (sourcePoint: Vec2, targetPoint: Vec2, excludeId?: number, debug?: boolean): boolean {
    const inRange = this.isPointInRange(sourcePoint, targetPoint)
    if (!inRange) return false
    const clear = this.isClear(sourcePoint, targetPoint, excludeId, debug)
    return clear
  }

  /*
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
    return lines.some(line => this.isVisible(line.a, line.b, toFeature.id))
  }
  */

  getNearestSide (sourcePoint: Vec2, targetFeature: Feature, targetPolygon: PolygonShape): Vec2[] {
    const targetCorners = targetPolygon.m_vertices.map(v => targetFeature.body.getWorldPoint(v))
    const nearestCornerIndex = getNearestIndex(sourcePoint, targetCorners)
    const nearestCorner = targetCorners[nearestCornerIndex]
    const cornerA = targetCorners[(nearestCornerIndex + 1) % 4]
    const cornerB = targetCorners[nearestCornerIndex > 0 ? nearestCornerIndex - 1 : 3]
    const directionA = normalize(Vec2.sub(cornerA, nearestCorner))
    const directionB = normalize(Vec2.sub(cornerB, nearestCorner))
    const pointA = Vec2.add(nearestCorner, directionA)
    const pointB = Vec2.add(nearestCorner, directionB)
    const distanceA = Vec2.distance(pointA, sourcePoint)
    const distanceB = Vec2.distance(pointB, sourcePoint)
    const otherCorner = distanceA < distanceB ? cornerA : cornerB
    return [nearestCorner, otherCorner]
  }

  checkCircleToPolygon (sourceFeature: Feature, targetFeature: Feature, sourceCircle: CircleShape, targetPolygon: PolygonShape): Boolean {
    const sourceCenter = sourceFeature.body.getWorldCenter()
    const nearestSide = this.getNearestSide(sourceCenter, targetFeature, targetPolygon)
    const nearestCorner = nearestSide[0]
    const otherCorner = nearestSide[1]
    const sideDirection = Vec2.sub(nearestSide[1], nearestSide[0])
    const perpDirection = rotate(sideDirection, Math.PI / 2)
    const numerator = Vec2.crossVec2Vec2(Vec2.sub(sourceCenter, nearestCorner), perpDirection)
    const denominator = Vec2.crossVec2Vec2(sideDirection, perpDirection)
    const sideLength = Vec2.distance(nearestCorner, otherCorner)
    const nearestWeight = Math.max(0, Math.min(sideLength, numerator / denominator))
    console.log('nearestWeight', nearestWeight)
    const nearestPoint = Vec2.combine(1, nearestCorner, nearestWeight, sideDirection)
    this.isClear(sourceCenter, nearestPoint)
    return true
    /*
    const lines: Line[] = []
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
      lines.push(new Line({ a: globalFromCenter, b: point1 }))
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
        lines.push(new Line({ a: globalFromCenter, b: toPosition }))
        lines.push(new Line({ a: fromRightPosition, b: toPosition }))
        lines.push(new Line({ a: fromLeftPosition, b: toPosition }))
      })
    })
    return lines.some(line => this.isVisible(line.a, line.b, toFeature.id))
    */
  }

  isFeatureVisible (sourceFeature: Feature, targetFeature: Feature): Boolean {
    if (targetFeature.label === 'barrier') {
      return true
    }
    if (targetFeature.actor.id === sourceFeature.actor.id) return true
    const sourceShape = sourceFeature.fixture.getShape()
    const targetShape = targetFeature.fixture.getShape()
    if (sourceShape instanceof CircleShape && targetShape instanceof CircleShape) {
      // return this.checkCircleToCircle(this, targetFeature, sourceShape, targetShape)
      return true
    }
    if (sourceShape instanceof CircleShape && targetShape instanceof PolygonShape) {
      return this.checkCircleToPolygon(sourceFeature, targetFeature, sourceShape, targetShape)
    }
    return true
  }
}
