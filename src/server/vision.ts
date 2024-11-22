
import { HALF_SIGHT } from '../shared/sight'
import { Feature } from './feature/feature'
import { Vec2, CircleShape, PolygonShape, Fixture } from 'planck'
import { Stage } from './stage'
import { BLUE, LIME, RED, YELLOW } from '../shared/color'
import { directionFromTo, getAngleDifference, getNearestIndex, normalize, rotate, vecToAngle, whichMax } from './math'
import { RayCastHit } from '../shared/rayCastHit'

export class Vision {
  stage: Stage

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  isPointInRange (sourcePoint: Vec2, targetPoint: Vec2): boolean {
    const upper = Vec2.add(sourcePoint, HALF_SIGHT)
    const lower = Vec2.sub(sourcePoint, HALF_SIGHT)
    const xInside = lower.x <= targetPoint.x && targetPoint.x <= upper.x
    const yInside = lower.y <= targetPoint.y && targetPoint.y <= upper.y
    return xInside && yInside
  }

  isClear (sourcePoint: Vec2, targetPoint: Vec2, excludeIds?: number[], debug?: boolean): boolean {
    let clear = true
    this.stage.world.rayCast(sourcePoint, targetPoint, (fixture, point, normal, fraction) => {
      const collideFeature = fixture.getUserData()
      if (!(collideFeature instanceof Feature)) return 1
      const excluded = excludeIds?.includes(collideFeature.id)
      const membrany = collideFeature.label === 'membrane' || collideFeature.label === 'egg'
      if (excluded === true || membrany) return 1
      clear = false
      return 0
    })
    if (this.stage.flags.vision || debug === true) {
      const color = clear ? LIME : RED
      this.stage.debugLine({
        a: sourcePoint,
        b: targetPoint,
        color
      })
    }
    return clear
  }

  isVisible (sourcePoint: Vec2, targetPoint: Vec2, excludeIds?: number[], debug?: boolean): boolean {
    const inRange = this.isPointInRange(sourcePoint, targetPoint)
    if (!inRange) {
      if (this.stage.flags.vision || debug === true) {
        this.stage.debugLine({
          a: sourcePoint,
          b: targetPoint,
          color: BLUE
        })
      }
      return false
    }
    const clear = this.isClear(sourcePoint, targetPoint, excludeIds, debug)
    return clear
  }

  getNearSideCorners (sourcePoint: Vec2, targetFeature: Feature, targetPolygon: PolygonShape): Vec2[] {
    const targetLocalSourcePoint = targetFeature.body.getLocalPoint(sourcePoint)
    if (targetPolygon.m_vertices.length === 4) {
      const sideCorners = targetPolygon.m_vertices.filter(vertex => {
        const y = Math.sign(vertex.y) * targetLocalSourcePoint.y
        const x = Math.sign(vertex.x) * targetLocalSourcePoint.x
        const visibleY = y >= Math.abs(vertex.y)
        const visibleX = x >= Math.abs(vertex.x)
        return visibleX || visibleY
      }).map(vertex => {
        return targetFeature.body.getWorldPoint(vertex)
      })
      return sideCorners
    }
    const vertexIndicies = [0, 1, 2]
    const indexPairs: number[][] = []
    vertexIndicies.forEach(i => {
      vertexIndicies.forEach(j => {
        if (i < j) {
          indexPairs.push([i, j])
        }
      })
    })
    const pairAngles = indexPairs.map(pair => {
      const indices = [0, 1].map(i => pair[i])
      const vertices = indices.map(i => targetPolygon.m_vertices[i])
      const angles = vertices.map(vertex => {
        return vecToAngle(directionFromTo(targetLocalSourcePoint, vertex))
      })
      return Math.abs(getAngleDifference(angles[0], angles[1]))
    })
    const widePair = indexPairs[whichMax(pairAngles)]
    const wideVertices = widePair.map(i => targetPolygon.m_vertices[i])
    return wideVertices.map(vertex => targetFeature.body.getWorldPoint(vertex))
  }

  getBetweenVertices (sourcePoint: Vec2, targetFeature: Feature, targetPolygon: PolygonShape): Vec2[] {
    const nearSideCorners = this.getNearSideCorners(sourcePoint, targetFeature, targetPolygon)
    let cornerA = Vec2.zero()
    let cornerB = Vec2.zero()
    if (nearSideCorners.length === 2) {
      cornerA = nearSideCorners[0]
      cornerB = nearSideCorners[1]
    } else {
      const targetCorners = targetPolygon.m_vertices.map(v => targetFeature.body.getWorldPoint(v))
      const nearestCornerIndex = getNearestIndex(sourcePoint, targetCorners)
      cornerA = targetCorners[(nearestCornerIndex + 1) % targetCorners.length]
      cornerB = targetCorners[nearestCornerIndex > 0 ? nearestCornerIndex - 1 : targetCorners.length - 1]
    }
    const directionA = directionFromTo(cornerA, sourcePoint)
    const directionB = directionFromTo(cornerB, sourcePoint)
    const trimCornerA = Vec2.combine(1, cornerA, 0.00, directionA)
    const trimCornerB = Vec2.combine(1, cornerB, 0.00, directionB)
    const vertices = [sourcePoint, trimCornerA, trimCornerB]
    return vertices
  }

  getNearestSide (sourcePoint: Vec2, targetFeature: Feature, targetPolygon: PolygonShape): Vec2[] {
    const targetCorners = targetPolygon.m_vertices.map(v => targetFeature.body.getWorldPoint(v))
    const nearestCornerIndex = getNearestIndex(sourcePoint, targetCorners)
    const nearestCorner = targetCorners[nearestCornerIndex]
    const cornerA = targetCorners[(nearestCornerIndex + 1) % targetCorners.length]
    const cornerB = targetCorners[nearestCornerIndex > 0 ? nearestCornerIndex - 1 : 2]
    const directionA = normalize(Vec2.sub(cornerA, nearestCorner))
    const directionB = normalize(Vec2.sub(cornerB, nearestCorner))
    const pointA = Vec2.add(nearestCorner, directionA)
    const pointB = Vec2.add(nearestCorner, directionB)
    const distanceA = Vec2.distance(pointA, sourcePoint)
    const distanceB = Vec2.distance(pointB, sourcePoint)
    const otherCorner = distanceA < distanceB ? cornerA : cornerB
    return [nearestCorner, otherCorner]
  }

  getLineLineIntersection (a: Vec2, b: Vec2, c: Vec2, d: Vec2): Vec2 {
    const vector1 = Vec2.sub(b, a)
    const vector2 = Vec2.sub(d, c)
    const weight1 = Vec2.cross(d, c) / Vec2.cross(vector1, vector2)
    const weight2 = Vec2.cross(b, a) / Vec2.cross(vector1, vector2)
    const intersection = Vec2.combine(weight1, vector1, weight2, vector2)
    return intersection
  }

  getNearestPoint (sourcePoint: Vec2, targetFeature: Feature, targetPolygon: PolygonShape): Vec2 {
    const nearestSide = this.getNearestSide(sourcePoint, targetFeature, targetPolygon)
    const nearestCorner = nearestSide[0]
    const otherCorner = nearestSide[1]
    const sideDirection = Vec2.sub(nearestSide[1], nearestSide[0])
    const perpDirection = rotate(sideDirection, Math.PI / 2)
    const numerator = Vec2.crossVec2Vec2(Vec2.sub(sourcePoint, nearestCorner), perpDirection)
    const denominator = Vec2.crossVec2Vec2(sideDirection, perpDirection)
    const sideLength = Vec2.distance(nearestCorner, otherCorner)
    const nearestWeight = Math.max(0, Math.min(sideLength, numerator / denominator))
    const nearestPoint = Vec2.combine(1, nearestCorner, nearestWeight, sideDirection)
    return nearestPoint
  }

  rayCast (point1: Vec2, point2: Vec2, excludeIds?: number[]): RayCastHit[] {
    const hits: RayCastHit[] = []
    this.stage.world.rayCast(point1, point2, function (fixture: Fixture, point: Vec2): number {
      const feature = fixture.getUserData()
      if (!(feature instanceof Feature)) return -1
      if (excludeIds?.includes(feature.id) === true || fixture.isSensor()) {
        return -1
      }
      hits.push(new RayCastHit({ feature, point }))
      return -1
    })
    hits.sort((hit1, hit2) => {
      const distance1 = Vec2.distance(point1, hit1.point)
      const distance2 = Vec2.distance(point1, hit2.point)
      return distance1 - distance2
    })
    return hits
  }

  getFirstHit (rayStart: Vec2, direction: Vec2, excludeIds?: number[]): RayCastHit {
    const rayEnd = Vec2.combine(1, rayStart, 2 * HALF_SIGHT.x, direction)
    const hits = this.rayCast(rayStart, rayEnd, excludeIds)
    const legitHits = hits.filter(hit => {
      if (hit.feature == null) return false
      const shape = hit.feature.fixture.getShape()
      if (!(shape instanceof PolygonShape)) return true
      const perpDirection = rotate(direction, 0.5 * Math.PI)
      const worldVertices = shape.m_vertices.map(vertex => {
        if (hit.feature == null) return Vec2(0, 0)
        return hit.feature.body.getWorldPoint(vertex)
      })
      const dotProducts = worldVertices.map(vertex => {
        if (hit.feature == null) return 0
        const hitDirection = Vec2.sub(vertex, hit.point)
        return Vec2.dot(perpDirection, hitDirection)
      })
      const dotProductProducts: number[] = []
      dotProducts.forEach(dotProductA => {
        dotProducts.forEach(dotProductB => {
          dotProductProducts.push(dotProductA * dotProductB)
        })
      })
      const legit = dotProductProducts.some(product => product < -0.001)
      return legit
    })
    return legitHits.length > 0 ? legitHits[0] : new RayCastHit({ feature: undefined, point: rayEnd })
  }

  checkCircleToPolygon (sourceFeature: Feature, targetFeature: Feature, sourceCircle: CircleShape, targetPolygon: PolygonShape): boolean {
    const sourceCenter = sourceFeature.body.getPosition()
    const sourcePoints = [sourceCenter]
    return sourcePoints.some(sourcePoint => {
      return this.checkPointToPolygon(sourcePoint, sourceFeature, targetFeature, targetPolygon)
    })
  }

  getObstructions (polygon: PolygonShape, sourceId: number, targetId: number): Feature[] {
    const featuresInShape = this.stage.getFeaturesInShape(polygon)
    const obstructions = featuresInShape.filter(feature => {
      const shape = feature.fixture.getShape()
      if (shape instanceof CircleShape) return false
      return feature.id !== sourceId && feature.id !== targetId && feature.id
    })
    return obstructions
  }

  // Does this work??
  checkCircleToCircle (
    sourceFeature: Feature,
    targetFeature: Feature,
    sourceCircle: CircleShape,
    targetCircle: CircleShape
  ): boolean {
    const debug = false
    const sourcePoint = sourceFeature.body.getPosition()
    const targetPoint = targetFeature.body.getPosition()
    if (this.isVisible(sourcePoint, targetPoint, undefined, debug)) {
      return true
    }
    const direction = directionFromTo(sourcePoint, targetPoint)
    const rightDirection = rotate(direction, 0.5 * Math.PI)
    const rightSourcePoint = Vec2.combine(1, sourcePoint, sourceCircle.getRadius(), rightDirection)
    const rightTargetPoint = Vec2.combine(1, targetPoint, targetCircle.getRadius(), rightDirection)
    const leftDirection = rotate(direction, -0.5 * Math.PI)
    const leftSourcePoint = Vec2.combine(1, sourcePoint, sourceCircle.getRadius(), leftDirection)
    const leftTargetPoint = Vec2.combine(1, targetPoint, targetCircle.getRadius(), leftDirection)
    const clearLineLeft = this.isVisible(leftSourcePoint, leftTargetPoint, [sourceFeature.id, targetFeature.id])
    if (clearLineLeft) {
      return true
    }
    const clearLineRight = this.isVisible(rightSourcePoint, rightTargetPoint, [sourceFeature.id, targetFeature.id])
    if (clearLineRight) return true
    const betweenVertices = [
      rightSourcePoint,
      leftSourcePoint,
      rightTargetPoint,
      leftTargetPoint
    ]
    const betweenPolygon = new PolygonShape(betweenVertices)
    const targetCorners = [
      rightTargetPoint,
      leftTargetPoint
    ]
    if (debug) this.stage.debugPolygon({ polygon: betweenPolygon, color: RED })
    const obstructions = this.getObstructions(betweenPolygon, sourceFeature.id, targetFeature.id)
    if (obstructions.length === 0) {
      return true
    }
    let visible = false
    obstructions.forEach(obstruction => {
      const shape = obstruction.fixture.getShape()
      if (!(shape instanceof PolygonShape)) return
      const featureBetweenVertices = this.getBetweenVertices(sourcePoint, obstruction, shape)
      const outerCorners = featureBetweenVertices.slice(1).filter(corner => {
        return this.isClear(sourcePoint, corner, [obstruction.id, targetFeature.id])
      })
      outerCorners.forEach(corner => {
        const circle = new CircleShape(corner, 0.2)
        if (debug) this.stage.debugCircle({ circle, color: RED })
      })
      outerCorners.forEach(corner => {
        const rayDirection = directionFromTo(sourcePoint, corner)
        const firstHit = this.getFirstHit(sourcePoint, rayDirection)
        if (debug) this.stage.debugLine({ a: sourcePoint, b: firstHit.point, color: YELLOW })
        if (firstHit.feature != null && firstHit.feature.id === targetFeature.id) visible = true
        const worldCorners = shape.m_vertices.map(corner => {
          return obstruction.body.getWorldPoint(corner)
        })
        worldCorners.forEach((cornerA, i) => {
          const cornerB = worldCorners[(i + 1) % worldCorners.length]
          const rayDirA = directionFromTo(cornerB, cornerA)
          const rayDirB = directionFromTo(cornerA, cornerB)
          const firstHitA = this.getFirstHit(cornerA, rayDirA)
          const firstHitB = this.getFirstHit(cornerB, rayDirB)
          if (debug) this.stage.debugLine({ a: cornerA, b: firstHitA.point, color: LIME })
          if (debug) this.stage.debugLine({ a: cornerB, b: firstHitB.point, color: LIME })
          if (firstHitA.feature != null && firstHitB.feature != null) {
            const hitFeatures = [firstHitA.feature, firstHitB.feature]
            const hitSource = hitFeatures.includes(sourceFeature)
            const hitTarget = hitFeatures.includes(targetFeature)
            if (hitSource && hitTarget) {
              visible = true
            }
          }
          targetCorners.forEach(targetCorner => {
            const rayDir = directionFromTo(targetCorner, cornerA)
            const firstHit = this.getFirstHit(targetCorner, rayDir)
            if (debug) this.stage.debugLine({ a: targetCorner, b: firstHit.point, color: YELLOW })
            if (firstHit.feature?.id === sourceFeature.id) {
              visible = true
            }
          })
        })
      })
    })
    return visible
  }

  checkPointToPolygon (
    sourcePoint: Vec2,
    sourceFeature: Feature,
    targetFeature: Feature,
    targetPolygon: PolygonShape
  ): boolean {
    const debug = false
    const nearestPoint = this.getNearestPoint(sourcePoint, targetFeature, targetPolygon)
    if (debug) {
      this.stage.debugLine({ a: sourcePoint, b: nearestPoint, color: YELLOW })
    }
    const nearDir = directionFromTo(sourcePoint, nearestPoint)
    const nearHit = this.getFirstHit(sourcePoint, nearDir)
    if (nearHit.feature?.id === targetFeature.id) return true
    const betweenVertices = this.getBetweenVertices(sourcePoint, targetFeature, targetPolygon)
    const clearCorner1 = this.isVisible(sourcePoint, betweenVertices[1], [sourceFeature.id, targetFeature.id])
    const clearCorner2 = this.isVisible(sourcePoint, betweenVertices[2], [sourceFeature.id, targetFeature.id])
    const betweenPolygon = new PolygonShape(betweenVertices)
    if (debug) this.stage.debugPolygon({ polygon: betweenPolygon, color: RED })
    if (clearCorner1 || clearCorner2) return true
    const obstructions = this.getObstructions(betweenPolygon, sourceFeature.id, targetFeature.id)
    if (obstructions.length === 0) return true
    let visible = false
    obstructions.forEach(obstruction => {
      const shape = obstruction.fixture.getShape()
      if (!(shape instanceof PolygonShape)) return
      const featureBetweenVertices = this.getBetweenVertices(sourcePoint, obstruction, shape)
      const outerCorners = featureBetweenVertices.slice(1).filter(corner => {
        return this.isClear(sourcePoint, corner, [obstruction.id, targetFeature.id])
      })
      outerCorners.forEach(corner => {
        const circle = new CircleShape(corner, 0.2)
        if (debug) this.stage.debugCircle({ circle, color: RED })
      })
      outerCorners.forEach(corner => {
        const rayDirection = directionFromTo(sourcePoint, corner)
        const firstHit = this.getFirstHit(sourcePoint, rayDirection)
        const inRange = this.isPointInRange(sourcePoint, firstHit.point)
        if (!inRange) return
        if (debug) this.stage.debugLine({ a: sourcePoint, b: firstHit.point, color: YELLOW })
        if (firstHit.feature != null && firstHit.feature.id === targetFeature.id) visible = true
        const worldCorners = shape.m_vertices.map(corner => {
          return obstruction.body.getWorldPoint(corner)
        })
        worldCorners.forEach((cornerA, i) => {
          const cornerB = worldCorners[(i + 1) % worldCorners.length]
          const rayDirA = directionFromTo(cornerB, cornerA)
          const rayDirB = directionFromTo(cornerA, cornerB)
          const firstHitA = this.getFirstHit(cornerA, rayDirA)
          const firstHitB = this.getFirstHit(cornerB, rayDirB)
          if (debug) this.stage.debugLine({ a: cornerA, b: firstHitA.point, color: LIME })
          if (debug) this.stage.debugLine({ a: cornerB, b: firstHitB.point, color: LIME })
          if (firstHitA.feature != null && firstHitB.feature != null) {
            const hitFeatures = [firstHitA.feature, firstHitB.feature]
            const hitSource = hitFeatures.includes(sourceFeature)
            const hitTarget = hitFeatures.includes(targetFeature)
            if (hitSource && hitTarget) visible = true
          }
          // targetCorners.forEach(targetCorner => {
          //   const rayDir = directionFromTo(targetCorner, cornerA)
          //   const firstHit = this.getFirstHit(targetCorner, rayDir)
          //   if (debug) this.stage.debugLine({ a: targetCorner, b: firstHit.point, color: Color.WHITE })
          //   if (firstHit.feature?.id === sourceFeature.id) visible = true
          // })
        })
      })
    })
    return visible
  }

  isFeatureVisible (sourceFeature: Feature, targetFeature: Feature): boolean {
    if (!this.stage.flags.visionY) {
      return true
    }
    if (targetFeature.label === 'structure') {
      return true
    }
    if (targetFeature.actor.id === sourceFeature.actor.id) return true
    const sourceShape = sourceFeature.fixture.getShape()
    const targetShape = targetFeature.fixture.getShape()
    if (sourceShape instanceof CircleShape && targetShape instanceof CircleShape) {
      return this.checkCircleToCircle(sourceFeature, targetFeature, sourceShape, targetShape)
    }
    if (sourceShape instanceof CircleShape && targetShape instanceof PolygonShape) {
      const polygonVisible = this.checkCircleToPolygon(sourceFeature, targetFeature, sourceShape, targetShape)
      return polygonVisible
    }
    return true
  }
}
