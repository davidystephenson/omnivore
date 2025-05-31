import { Vec2 } from 'planck'

export const HALF_SIGHT_HEIGHT = 20
export const SIGHT_RATIO = 16 / 9
export const HALF_SIGHT_WIDTH = HALF_SIGHT_HEIGHT * SIGHT_RATIO
export const HALF_SIGHT_SIZE = Vec2(HALF_SIGHT_WIDTH, HALF_SIGHT_HEIGHT)
export const SIGHT_HEIGHT = HALF_SIGHT_HEIGHT * 2
export const SIGHT_WIDTH = HALF_SIGHT_WIDTH * 2
export const SIGHT_SIZE = Vec2(SIGHT_WIDTH, SIGHT_HEIGHT)
export const SIGHT = {
  halfHeight: HALF_SIGHT_HEIGHT,
  halfWidth: HALF_SIGHT_WIDTH,
  ratio: SIGHT_RATIO,
  halfSize: HALF_SIGHT_SIZE,
  height: SIGHT_HEIGHT,
  width: SIGHT_WIDTH,
  size: SIGHT_SIZE
}
