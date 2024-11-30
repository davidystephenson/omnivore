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
    this.stage.log({ k: 'starveBricksY', v: this.stage.flags.starveBricksY })
    if (this.stage.flags.starveBricksY) {
      const victimPosition = this.victim.body.getPosition()
      const lookLowerBound = Vec2(victimPosition.x - HALF_SIGHT.x, victimPosition.y - HALF_SIGHT.y)
      const lookUpperBound = Vec2(victimPosition.x + HALF_SIGHT.x, victimPosition.y + HALF_SIGHT.y)
      const lookBox = new AABB(lookLowerBound, lookUpperBound)
      const brickBox = this.trim({ base: victimPosition, lookBox })
      // scale by speed
      const length = this.victim.body.getLinearVelocity().length()
      this.stage.log({ k: 'length', v: length })
      const scale = Math.min(1, length / 30) // this.victim.body.getLinearVelocity().length()
      this.stage.log({ k: 'scale', v: scale })
      const halfWidth = brickBox.getExtents().x * scale
      const halfHeight = brickBox.getExtents().y * scale
      const brickPosition = brickBox.getCenter()
      const minimum = Math.min(halfWidth, halfHeight)
      this.stage.log({ k: 'minimum', v: minimum })
      const sized = minimum > 0.1
      this.stage.log({ k: 'sized', v: sized })
      if (sized) {
        void new Brick({ halfWidth, halfHeight, position: brickPosition, stage: this.stage })
      }
    }
    super.execute()
  }
}
