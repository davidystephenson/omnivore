import { AABB, Vec2 } from 'planck'

export function range (a: number, b: number): number[] {
  return [...Array(b - a + 1).keys()].map(i => a + i)
}

export function normalize (vector: Vec2): Vec2 {
  const normalized = Vec2(vector.x, vector.y)
  normalized.normalize()
  return normalized
}

export function angleToDirection (angle: number): Vec2 {
  return Vec2(Math.cos(angle), Math.sin(angle))
}

export function directionFromTo (from: Vec2, to: Vec2): Vec2 {
  return normalize(Vec2.sub(to, from))
}

export function rotate (vector: Vec2, angle: number): Vec2 {
  const x = vector.x * Math.cos(angle) - vector.y * Math.sin(angle)
  const y = vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
  return Vec2(x, y)
}

export function getCompass (vector: Vec2): Vec2 {
  if (Math.abs(vector.x) > Math.abs(vector.y)) {
    const sign = vector.x > 0 ? 1 : -1
    return Vec2(sign, 0)
  }
  const sign = vector.y > 0 ? 1 : -1
  return Vec2(0, sign)
}

export function getNearestIndex (fromPoint: Vec2, toPoints: Vec2[]): number {
  let nearestIndex = 0
  let minDistance = Vec2.distance(fromPoint, toPoints[nearestIndex])
  toPoints.forEach((toPoint, index) => {
    const distance = Vec2.distance(fromPoint, toPoint)
    if (distance < minDistance) {
      nearestIndex = index
      minDistance = distance
    }
  })
  return nearestIndex
}

export function getIntersectionBox (a: AABB, b: AABB): AABB {
  const lower = Vec2(Math.max(a.lowerBound.x, b.lowerBound.x), Math.max(a.lowerBound.y, b.lowerBound.y))
  const upper = Vec2(Math.min(a.upperBound.x, b.upperBound.x), Math.min(a.upperBound.y, b.upperBound.y))
  return new AABB(lower, upper)
}

export function getUnionBox (a: AABB, b: AABB): AABB {
  const lower = Vec2(Math.min(a.lowerBound.x, b.lowerBound.x), Math.min(a.lowerBound.y, b.lowerBound.y))
  const upper = Vec2(Math.max(a.upperBound.x, b.upperBound.x), Math.max(a.upperBound.y, b.upperBound.y))
  return new AABB(lower, upper)
}

export function whichMax (array: number[]): number {
  let indexMax = 0
  let valueMax = array[0]
  array.forEach((value, index) => {
    if (value > valueMax) {
      indexMax = index
      valueMax = value
    }
  })
  return indexMax
}

export function whichMin (array: number[]): number {
  const negArray = array.map(x => -x)
  return whichMax(negArray)
}

export function choose<type> (array: type[]): type {
  return array[Math.floor(Math.random() * array.length)]
}
