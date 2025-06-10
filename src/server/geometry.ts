import { CircleShape, PolygonShape, Vec2 } from 'planck'
import { Feature } from './feature/feature'
import { Stage } from './stage/stage'
import { directionFromTo } from './math'

export function getNearestOtherPoint (props: {
  debug?: boolean
  stage: Stage
  sourceFeature: Feature
  otherFeatures: Feature[]
}): Vec2 {
  const sourceShape = props.sourceFeature.fixture.getShape()
  if (!(sourceShape instanceof PolygonShape)) {
    throw new Error('sourceShape is not a polygon')
  }
  const sourceCorners = props.sourceFeature.polygon.vertices.map(vertex => {
    return props.sourceFeature.body.getWorldPoint(vertex)
  })
  let nearestOtherPoint = Vec2(0, 0)
  let minDistance = Infinity
  props.otherFeatures.forEach(otherFeature => {
    const otherShape = otherFeature.fixture.getShape()
    if (otherShape instanceof PolygonShape) {
      sourceCorners.forEach(sourceCorner => {
        const otherPoint = props.stage.vision.getNearestPoint({
          debug: props.debug,
          sourcePoint: sourceCorner,
          targetFeature: otherFeature,
          targetPolygon: otherShape
        })
        const distance = Vec2.distance(sourceCorner, otherPoint)
        if (distance < minDistance) {
          minDistance = distance
          nearestOtherPoint = otherPoint
        }
      })
    }
    if (otherShape instanceof CircleShape) {
      const circleCenter = otherShape.getCenter()
      const sidePoint = props.stage.vision.getNearestPoint({
        sourcePoint: circleCenter,
        targetFeature: props.sourceFeature,
        targetPolygon: sourceShape
      })
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
