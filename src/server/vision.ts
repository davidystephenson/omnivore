
import { SIGHT } from '../shared/sight'
import { Feature } from './feature/feature'
import { Vec2, AABB, CircleShape, PolygonShape, testOverlap, Transform, Shape, Fixture, DistanceInput, SimplexCache, DistanceOutput, Distance, Vec2Value } from 'planck'
import { Stage } from './stage'
import { Color } from '../shared/color'
import { directionFromTo, getNearestIndex, normalize, range, rotate } from './math'
import { LineFigure } from '../shared/lineFigure'
import { Chunk } from './feature/chunk'
import { RayCastHit } from '../shared/rayCastHit'

export class Vision {
  stage: Stage

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
  }

  getSightBox (source: Feature): AABB {
    const position = source.body.getPosition()
    const upper = Vec2.add(position, SIGHT)
    const lower = Vec2.sub(position, SIGHT)
    const sightBox = new AABB(lower, upper)
    return sightBox
  }

  getFeaturesInBox (box: AABB): Feature[] {
    const featuresInBox: Feature[] = []
    this.stage.world.queryAABB(box, fixture => {
      const feature = fixture.getUserData() as Feature
      featuresInBox.push(feature)
      return true
    })
    return featuresInBox
  }

  getShapeDistance (transformA: Transform, transformB: Transform, shapeA: Shape, shapeB: Shape): number {
    const input = new DistanceInput()
    input.proxyA.set(shapeA, 0)
    input.proxyB.set(shapeB, 0)
    input.transformA.set(transformA)
    input.transformB.set(transformB)
    input.useRadii = false
    const cache = new SimplexCache()
    const output = new DistanceOutput()
    Distance(output, cache, input)
    const circleA = new CircleShape(output.pointA, 0.3)
    const circleB = new CircleShape(output.pointB, 0.2)
    this.stage.debugCircle({ circle: circleA, color: Color.YELLOW })
    this.stage.debugCircle({ circle: circleB, color: Color.MAGENTA })
    return output.distance
  }

  getSimplexWeights (corners: Vec2[], point: Vec2Value): number[] {
    if (corners.length !== 3) throw new Error(`getSimplexWeights: corners.length = ${corners.length} !== 3`)
    const weights = corners.map((corner, index) => {
      const otherCornerA = corners[(index + 1) % 3]
      const otherCornerB = corners[(index + 2) % 3]
      const oppositeVector = Vec2.sub(otherCornerB, otherCornerA)
      const oppositeDirection = normalize(oppositeVector)
      const perpDirection = rotate(oppositeDirection, Math.PI / 2)
      const perpPoint = Vec2.add(corner, perpDirection)
      const intersection = this.getLineLineIntersection(otherCornerA, otherCornerB, corner, perpPoint)
      const perpVector = Vec2.sub(intersection, corner)
      const pointVector = Vec2.sub(point, corner)
      const depth = Vec2.dot(perpVector, pointVector) / Vec2.dot(perpVector, perpVector)
      const weight = 1 - depth
      return weight
    })
    return weights
  }

  getFeaturesInShape (shape: Shape): Feature[] {
    const featuresInShape: Feature[] = []
    const origin = new Transform()
    this.stage.runner.getBodies().forEach(body => {
      const feature = body.getUserData() as Feature
      const featureShape = feature.fixture.getShape()
      const overlap = testOverlap(shape, 0, featureShape, 0, origin, body.getTransform())
      if (overlap) { featuresInShape.push(feature) }
      return true
    })
    return featuresInShape
  }

  getFeaturesInRange (source: Feature): Feature[] {
    const sightBox = this.getSightBox(source)
    const featuresInBox = this.getFeaturesInBox(sightBox)
    this.stage.runner.getBodies().forEach(body => {
      const feature = body.getUserData() as Feature
      if (feature.label === 'barrier') {
        featuresInBox.push(feature)
      }
    })
    return featuresInBox
  }

  isPointInRange (sourcePoint: Vec2, targetPoint: Vec2): boolean {
    const upper = Vec2.add(sourcePoint, SIGHT)
    const lower = Vec2.sub(sourcePoint, SIGHT)
    const xInside = lower.x <= targetPoint.x && targetPoint.x <= upper.x
    const yInside = lower.y <= targetPoint.y && targetPoint.y <= upper.y
    return xInside && yInside
  }

  isClear (sourcePoint: Vec2, targetPoint: Vec2, excludeIds?: number[], debug?: boolean): boolean {
    let clear = true
    this.stage.world.rayCast(sourcePoint, targetPoint, (fixture, point, normal, fraction) => {
      const collideFeature = fixture.getUserData() as Feature
      const excluded = excludeIds?.includes(collideFeature.id)
      const isMouth = collideFeature.label === 'mouth' || collideFeature.label === 'egg'
      if (excluded === true || isMouth) return 1
      clear = false
      return 0
    })
    if (debug === true) {
      const color = clear ? Color.LIME : Color.RED
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
      if (debug === true) {
        this.stage.debugLine({
          a: sourcePoint,
          b: targetPoint,
          color: Color.BLUE
        })
      }
      return false
    }
    const clear = this.isClear(sourcePoint, targetPoint, excludeIds, debug)
    return clear
  }

  checkCircleToCircle (
    sourceFeature: Feature,
    targetFeature: Feature,
    sourceCircle: CircleShape,
    targetCircle: CircleShape
  ): boolean {
    const myPosition = sourceFeature.body.getPosition()
    const targetPosition = targetFeature.body.getPosition()
    const lines: LineFigure[] = [new LineFigure({ a: myPosition, b: targetPosition })]
    const direction = directionFromTo(myPosition, targetPosition)
    const rightDirection = rotate(direction, 0.5 * Math.PI)
    const rightSelfPosition = Vec2.combine(1, myPosition, sourceCircle.getRadius(), rightDirection)
    const rightTargetPosition = Vec2.combine(1, targetPosition, targetCircle.getRadius(), rightDirection)
    lines.push(new LineFigure({ a: rightSelfPosition, b: rightTargetPosition }))
    const leftDirection = rotate(direction, -0.5 * Math.PI)
    const leftSelfPosition = Vec2.combine(1, myPosition, sourceCircle.getRadius(), leftDirection)
    const leftTargetPosition = Vec2.combine(1, targetPosition, targetCircle.getRadius(), leftDirection)
    lines.push(new LineFigure({ a: leftSelfPosition, b: leftTargetPosition }))
    return lines.some(line => this.isVisible(line.a, line.b, [targetFeature.id]))
  }

  getNearSideCorners (sourcePoint: Vec2, targetFeature: Feature, targetPolygon: PolygonShape): Vec2[] {
    const targetLocalSourcePoint = targetFeature.body.getLocalPoint(sourcePoint)
    const visibleCorners = targetPolygon.m_vertices.filter(vertex => {
      const y = Math.sign(vertex.y) * targetLocalSourcePoint.y
      const x = Math.sign(vertex.x) * targetLocalSourcePoint.x
      const visibleY = y >= Math.abs(vertex.y)
      const visibleX = x >= Math.abs(vertex.x)
      return visibleX || visibleY
    }).map(vertex => {
      return targetFeature.body.getWorldPoint(vertex)
    })
    return visibleCorners
  }

  // Currently only for rectangles. Extend this to work for triangles as well.
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
    // compute the intersection
    // https://mjoldfield.com/atelier/2016/04/intersect-2d.html
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

  rayCast (point1: Vec2, point2: Vec2): RayCastHit[] {
    const hits: RayCastHit[] = []
    this.stage.world.rayCast(point1, point2, function (fixture: Fixture, point: Vec2): number {
      const feature = fixture.getUserData() as Feature
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

  checkCircleToRectangle (sourceFeature: Feature, targetFeature: Feature, sourceCircle: CircleShape, targetPolygon: PolygonShape): boolean {
    const sourceCenter = sourceFeature.body.getPosition()
    const sourcePoints = [sourceCenter]
    /*
    targetPolygon.m_vertices.forEach(corner => {
      const toCenter = directionFromTo(corner, sourceCenter)
      const perpDirA = rotate(toCenter, +0.5 * Math.PI)
      const perpDirB = rotate(toCenter, -0.5 * Math.PI)
      sourcePoints.push(Vec2.combine(1, sourceCenter, 1, perpDirA))
      sourcePoints.push(Vec2.combine(1, sourceCenter, 1, perpDirB))
    })
    */
    return sourcePoints.some(sourcePoint => {
      return this.checkPointToRectangle(sourcePoint, sourceFeature, targetFeature, targetPolygon)
    })
  }

  getFirstHit (rayStart: Vec2, direction: Vec2): RayCastHit {
    const rayEnd = Vec2.combine(1, rayStart, SIGHT.x, direction)
    const hits = this.rayCast(rayStart, rayEnd)
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

  checkPointToRectangle (
    sourcePoint: Vec2,
    sourceFeature: Feature,
    targetFeature: Feature,
    targetPolygon: PolygonShape
  ): boolean {
    const betweenVertices = this.getBetweenVertices(sourcePoint, targetFeature, targetPolygon)
    const clearCorner1 = this.isVisible(sourcePoint, betweenVertices[1], [sourceFeature.id, targetFeature.id])
    const clearCorner2 = this.isVisible(sourcePoint, betweenVertices[2], [sourceFeature.id, targetFeature.id])
    const betweenPolygon = new PolygonShape(betweenVertices)
    // this.stage.debugPolygon({ polygon: betweenPolygon, color: Color.RED })
    if (clearCorner1 || clearCorner2) return true
    const featuresInShape = this.getFeaturesInShape(betweenPolygon)
    const obstructions = featuresInShape.filter(feature => {
      const shape = feature.fixture.getShape()
      if (shape instanceof CircleShape) return false
      return feature.id !== sourceFeature.id && feature.id !== targetFeature.id && feature.id
    })
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
        // const circle = new CircleShape(corner, 0.2)
        // this.stage.debugCircle({ circle, color: Color.RED })
      })
      outerCorners.forEach(corner => {
        const rayDirection = directionFromTo(sourcePoint, corner)
        const firstHit = this.getFirstHit(sourcePoint, rayDirection)
        // this.stage.debugLine({ a: sourcePoint, b: firstHit.point, color: Color.YELLOW })
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
          // this.stage.debugLine({ a: cornerA, b: firstHitA.point, color: Color.LIME })
          // this.stage.debugLine({ a: cornerB, b: firstHitB.point, color: Color.LIME })
          if (firstHitA.feature != null && firstHitB.feature != null) {
            const hitFeatures = [firstHitA.feature, firstHitB.feature]
            const hitSource = hitFeatures.includes(sourceFeature)
            const hitTarget = hitFeatures.includes(targetFeature)
            if (hitSource && hitTarget) visible = true
          }
        })
      })
    })
    return visible
  }

  checkCircleToTriangle (sourceFeature: Feature, targetFeature: Feature, sourceCircle: CircleShape, targetPolygon: PolygonShape): boolean {
    const sourceCenter = sourceFeature.body.getPosition()
    const nearestPoint = this.getNearestPoint(sourceCenter, targetFeature, targetPolygon)
    const nearestVisible = this.isVisible(sourceCenter, nearestPoint, [targetFeature.id])
    if (nearestVisible) return true
    const lines: LineFigure[] = []
    const targetCorners = targetPolygon.m_vertices.map(vertex => {
      return targetFeature.body.getWorldPoint(vertex)
    })
    const spacing = 1 // 0.6
    range(0, targetCorners.length - 1).forEach(i => {
      const j = (i + 1) % targetCorners.length
      const point1 = targetCorners[i]
      lines.push(new LineFigure({ a: sourceCenter, b: point1 }))
      const point2 = targetCorners[j]
      const distance = Vec2.distance(point1, point2)
      if (distance <= spacing) return false
      const segmentCount = Math.ceil(distance / spacing)
      const segmentLength = distance / segmentCount
      const segmentDirection = directionFromTo(point1, point2)
      range(0, segmentCount).forEach(i => {
        const toPosition = Vec2.combine(1, point1, i * segmentLength, segmentDirection)
        const inRange = this.isPointInRange(sourceCenter, toPosition)
        if (!inRange) return
        const direction = directionFromTo(sourceCenter, toPosition)
        const rightDirection = rotate(direction, 0.5 * Math.PI)
        const leftDirection = rotate(direction, -0.5 * Math.PI)
        const fromRightPosition = Vec2.combine(1, sourceCenter, sourceCircle.getRadius(), rightDirection)
        const fromLeftPosition = Vec2.combine(1, sourceCenter, sourceCircle.getRadius(), leftDirection)
        lines.push(new LineFigure({ a: sourceCenter, b: toPosition }))
        lines.push(new LineFigure({ a: fromRightPosition, b: toPosition }))
        lines.push(new LineFigure({ a: fromLeftPosition, b: toPosition }))
      })
    })
    return lines.some(line => this.isVisible(line.a, line.b, [targetFeature.id]))
  }

  isFeatureVisible (sourceFeature: Feature, targetFeature: Feature): boolean {
    if (targetFeature.label === 'barrier') {
      return true
    }
    if (targetFeature.actor.id === sourceFeature.actor.id) return true
    const sourceShape = sourceFeature.fixture.getShape()
    const targetShape = targetFeature.fixture.getShape()
    if (sourceShape instanceof CircleShape && targetShape instanceof CircleShape) {
      return this.checkCircleToCircle(sourceFeature, targetFeature, sourceShape, targetShape)
    }
    if (sourceShape instanceof CircleShape && targetShape instanceof PolygonShape) {
      if (targetFeature instanceof Chunk) {
        if (targetFeature.name === 'rectangle') {
          const rectangleVisible = this.checkCircleToRectangle(sourceFeature, targetFeature, sourceShape, targetShape)
          if (!rectangleVisible) {
            // this.stage.runner.paused = true
          }
          return rectangleVisible
        }
        if (targetFeature.name === 'triangle') {
          return this.checkCircleToTriangle(sourceFeature, targetFeature, sourceShape, targetShape)
        }
      }
      throw new Error('The PolygonShape is not from a Chunk')
    }
    return true
  }
}
