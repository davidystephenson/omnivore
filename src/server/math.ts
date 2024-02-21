import { Vec2 } from 'planck'

export function getCompass (vector: Vec2): Vec2 {
  if (Math.abs(vector.x) > Math.abs(vector.y)) {
    const sign = vector.x > 0 ? 1 : -1
    return Vec2(sign, 0)
  }
  const sign = vector.y > 0 ? 1 : -1
  return Vec2(0, sign)
}
