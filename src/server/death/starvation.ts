import { AABB, Vec2 } from 'planck'
import { HALF_SIGHT } from '../../shared/sight'
import { Membrane } from '../feature/membrane'
import { Stage } from '../stage/stage'
import { Death } from './death'
import { Brick } from '../actor/brick'

export class Starvation extends Death {
  constructor (props: { stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
  }

  execute (): void {
    this.stage.flag({ f: 'death', v: 'Starvation.execute' })
    const victimPosition = this.victim.body.getPosition()
    const lookLowerBound = Vec2(victimPosition.x - HALF_SIGHT.x, victimPosition.y - HALF_SIGHT.y)
    const lookUpperBound = Vec2(victimPosition.x + HALF_SIGHT.x, victimPosition.y + HALF_SIGHT.y)
    const lookBox = new AABB(lookLowerBound, lookUpperBound)
    const brickBox = this.trim({ base: victimPosition, lookBox })
    const halfWidth = brickBox.getExtents().x
    const halfHeight = brickBox.getExtents().y
    const brickPosition = brickBox.getCenter()
    const sized = Math.min(halfWidth, halfHeight) > 0
    if (sized) {
      void new Brick({ halfWidth, halfHeight, position: brickPosition, stage: this.stage })
    }
    super.execute()
  }
}
