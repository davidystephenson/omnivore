import { AABB, CircleShape, Vec2 } from 'planck'
import { HALF_SIGHT_SIZE } from '../../shared/sight'
import { Membrane } from '../feature/membrane'
import { Stage } from '../stage/stage'
import { Death } from './death'
import { Rock } from '../actor/rock'
import { GREEN, RED, WHITE } from '../../shared/color'

export class Starvation extends Death {
  constructor (props: { stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
  }

  execute (): void {
    this.deathLog({ v: 'Starvation.execute' })
    if (this.stage.flags.starveBricksGame) {
      const victimPosition = this.victim.body.getPosition()
      if (this.stage.flags.death) {
        const circle = new CircleShape(victimPosition, 0.15)
        this.stage.debugCircle({ circle, color: WHITE })
      }
      const lookLowerBound = Vec2(victimPosition.x - HALF_SIGHT_SIZE.x, victimPosition.y - HALF_SIGHT_SIZE.y)
      const lookUpperBound = Vec2(victimPosition.x + HALF_SIGHT_SIZE.x, victimPosition.y + HALF_SIGHT_SIZE.y)
      const lookBox = new AABB(lookLowerBound, lookUpperBound)
      const maximumBox = this.trim({ base: victimPosition, lookBox })
      if (this.stage.flags.death) {
        this.stage.debugAABB({ aabb: maximumBox, color: WHITE, width: 0.15 })
      }
      const length = this.victim.body.getLinearVelocity().length()
      this.deathLog({ k: 'length', v: length })
      const scale = Math.min(1, length / 10)
      this.deathLog({ k: 'scale', v: scale })
      const halfWidth = maximumBox.getExtents().x * Math.pow(scale, 0.5)
      const halfHeight = maximumBox.getExtents().y * Math.pow(scale, 0.5)
      const brickPosition = maximumBox.getCenter()
      if (this.stage.flags.death) {
        const circle = new CircleShape(brickPosition, 0.1)
        this.stage.debugCircle({ circle, color: GREEN })
      }
      const brickLeftX = brickPosition.x - halfWidth
      const brickRightX = brickPosition.x + halfWidth
      const brickTopY = brickPosition.y - halfHeight
      const brickBottomY = brickPosition.y + halfHeight
      const brickLowerBound = Vec2(brickLeftX, brickBottomY)
      const brickUpperBound = Vec2(brickRightX, brickTopY)
      const brickBox = new AABB(brickLowerBound, brickUpperBound)

      this.deathLog({ k: 'brickPosition', v: brickPosition })
      const minimum = Math.min(halfWidth, halfHeight)

      this.deathLog({ k: 'minimum', v: minimum })
      const sizable = minimum > Death.MINIMUM_SIZE
      if (this.stage.flags.death) {
        const color = sizable ? GREEN : RED
        this.stage.debugAABB({ aabb: brickBox, color })
      }
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
      this.stage.runner.paused = true
    }
    super.execute()
  }
}
