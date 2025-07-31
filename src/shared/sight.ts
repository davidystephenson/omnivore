import { Vec2 } from 'planck'

export const HALF_SIGHT_HEIGHT = 13
export const SIGHT_RATIO = 16 / 9
export const HALF_SIGHT_WIDTH = HALF_SIGHT_HEIGHT * SIGHT_RATIO
export const HALF_SIGHT_SIZE = Vec2(HALF_SIGHT_WIDTH, HALF_SIGHT_HEIGHT)
export const SIGHT_HEIGHT = HALF_SIGHT_HEIGHT * 2
export const SIGHT_WIDTH = HALF_SIGHT_WIDTH * 2
export const SIGHT_SIZE = Vec2(SIGHT_WIDTH, SIGHT_HEIGHT)
export const SIGHT = {
  halfHeight: HALF_SIGHT_HEIGHT,
  halfSize: HALF_SIGHT_SIZE,
  halfWidth: HALF_SIGHT_WIDTH,
  height: SIGHT_HEIGHT,
  ratio: SIGHT_RATIO,
  size: SIGHT_SIZE,
  width: SIGHT_WIDTH
}
