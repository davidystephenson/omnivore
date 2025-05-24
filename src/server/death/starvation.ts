import { AABB, Vec2 } from 'planck'
import { HALF_SIGHT_SIZE } from '../../shared/sight'
import { Membrane } from '../feature/membrane'
import { Stage } from '../stage/stage'
import { Death } from './death'
import { Rock } from '../actor/rock'

export class Starvation extends Death {
  constructor (props: { stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
  }

  execute (): void {
    this.deathLog({ v: 'Starvation.execute' })
    if (this.stage.flags.starveBricksGame) {
      const victimPosition = this.victim.body.getPosition()
      const lookLowerBound = Vec2(victimPosition.x - HALF_SIGHT_SIZE.x, victimPosition.y - HALF_SIGHT_SIZE.y)
      const lookUpperBound = Vec2(victimPosition.x + HALF_SIGHT_SIZE.x, victimPosition.y + HALF_SIGHT_SIZE.y)
      const lookBox = new AABB(lookLowerBound, lookUpperBound)
      const brickBox = this.trim({ base: victimPosition, lookBox })
      const length = this.victim.body.getLinearVelocity().length()
      this.deathLog({ k: 'length', v: length })
      const scale = Math.min(1, length / 10)
      this.deathLog({ k: 'scale', v: scale })
      const halfWidth = brickBox.getExtents().x * Math.pow(scale, 0.5)
      const halfHeight = brickBox.getExtents().y * Math.pow(scale, 0.5)
      const brickPosition = brickBox.getCenter()
      this.deathLog({ k: 'brickPosition', v: brickPosition })
      const minimum = Math.min(halfWidth, halfHeight)
      this.deathLog({ k: 'minimum', v: minimum })
      const sizable = minimum > Death.MINIMUM_SIZE
      if (sizable) {
        const health = Math.max(Death.MINIMUM_HEALTH, this.victim.actor.gene.stamina)
        this.deathLog({ k: 'health', v: health })
        void new Rock({
          halfWidth,
          halfHeight,
          health,
          position: brickPosition,
          stage: this.stage
        })
      }
    }
    super.execute()
  }
}
