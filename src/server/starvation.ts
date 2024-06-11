import { AABB, Vec2 } from 'planck'
import { SIGHT } from '../shared/sight'
import { Mouth } from './feature/mouth'
import { getCompass } from './math'
import { Stage } from './stage'
import { Death } from './death'
import { Brick } from './actor/brick'

export class Starvation extends Death {
  constructor (props: { killer: Mouth, stage: Stage, victim: Mouth }) {
    super({ stage: props.stage, victim: props.victim })
  }

  execute (props?: {
    debug?: boolean
  }): void {
    // WORK IN PROGRESS
    if (props?.debug === true) {
      console.debug('Killing.execute', this.victim)
    }
    const victimPosition = this.victim.body.getPosition()
    const brickDirection = getCompass(Vec2.sub(this.victim.deathPosition, victimPosition))
    const brickLookDistance = brickDirection.x !== 0 ? SIGHT.x : SIGHT.y
    const sideLookDistance = brickDirection.x !== 0 ? SIGHT.y : SIGHT.x
    const base = Vec2.combine(1, victimPosition, this.victim.radius, brickDirection)
    const sideDirections = [
      Vec2(-brickDirection.y, brickDirection.x),
      Vec2(brickDirection.y, -brickDirection.x)
    ]
    const nearLookPoints = sideDirections.map(sideDirection => {
      return Vec2.combine(1, base, sideLookDistance, sideDirection)
    })
    const farLookPoints = nearLookPoints.map((point: Vec2): Vec2 => {
      return Vec2.combine(1, point, brickLookDistance, brickDirection)
    })
    const lookPoints = [...nearLookPoints, ...farLookPoints]
    const lookPointsX = lookPoints.map(point => point.x)
    const lookPointsY = lookPoints.map(point => point.y)
    const lookLowerBound = Vec2(Math.min(...lookPointsX), Math.min(...lookPointsY))
    const lookUpperBound = Vec2(Math.max(...lookPointsX), Math.max(...lookPointsY))
    const lookBox = new AABB(lookLowerBound, lookUpperBound)
    const brickBox = this.trim({ base, lookBox })
    const halfWidth = brickBox.getExtents().x
    const halfHeight = brickBox.getExtents().y
    const brickPosition = brickBox.getCenter()
    if (Math.min(halfWidth, halfHeight) > 0) {
      if (props?.debug === true) {
        console.debug('Killing.execute new Brick', { halfWidth, halfHeight, brickPosition })
      }
      void new Brick({ stage: this.stage, halfWidth, halfHeight, position: brickPosition })
    }
  }
}
