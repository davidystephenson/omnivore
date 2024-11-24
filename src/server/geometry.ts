import { CircleShape, PolygonShape, Vec2 } from 'planck'
import { Feature } from './feature/feature'
import { Stage } from './stage/stage'
import { directionFromTo } from './math'

export function getNearestOtherPoint (stage: Stage, sourceFeature: Feature, otherFeatures: Feature[]): Vec2 {
  const sourceShape = sourceFeature.fixture.getShape()
  if (!(sourceShape instanceof PolygonShape)) {
    throw new Error('sourceShape is not a polygon')
  }
  const sourceCorners = sourceFeature.polygon.vertices.map(vertex => {
    return sourceFeature.body.getWorldPoint(vertex)
  })
  let nearestOtherPoint = Vec2(0, 0)
  let minDistance = Infinity
  otherFeatures.forEach(otherFeature => {
    const otherShape = otherFeature.fixture.getShape()
    if (otherShape instanceof PolygonShape) {
      sourceCorners.forEach(sourceCorner => {
        const otherPoint = stage.vision.getNearestPoint(sourceCorner, otherFeature, otherShape)
        const distance = Vec2.distance(sourceCorner, otherPoint)
        if (distance < minDistance) {
          minDistance = distance
          nearestOtherPoint = otherPoint
        }
      })
    }
    if (otherShape instanceof CircleShape) {
      const circleCenter = otherShape.getCenter()
      const sidePoint = stage.vision.getNearestPoint(circleCenter, sourceFeature, sourceShape)
      const direction = directionFromTo(circleCenter, sidePoint)
      const radius = otherShape.getRadius()
      const otherPoint = Vec2.combine(1, circleCenter, radius, direction)
      const distance = Vec2.distance(sidePoint, otherPoint)
      if (distance < minDistance) {
        minDistance = distance
        nearestOtherPoint = otherPoint
      }
    }
  })
  return nearestOtherPoint
}
