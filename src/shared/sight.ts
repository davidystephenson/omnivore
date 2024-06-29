import { Vec2 } from 'planck'

export const SIGHT_HEIGHT = 13
export const SIGHT_RATIO = 16 / 9
export const SIGHT_WIDTH = SIGHT_HEIGHT * SIGHT_RATIO
export const SIGHT = Vec2(SIGHT_WIDTH, SIGHT_HEIGHT)
export const SIGHT_HALF_HEIGHT = SIGHT_HEIGHT / 2
export const SIGHT_HALF_WIDTH = SIGHT_WIDTH / 2
export const HALF_SIGHT = Vec2(SIGHT_HALF_WIDTH, SIGHT_HALF_HEIGHT)
