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
      const maximumCenter = maximumBox.getCenter()
      this.deathLog({ k: 'maximumCenter', v: maximumCenter })
      if (this.stage.flags.death) {
        this.stage.debugAABB({ aabb: maximumBox, color: WHITE, width: 0.15 })
        const maximumCircle = new CircleShape(maximumCenter, 0.15)
        this.stage.debugCircle({ circle: maximumCircle, color: GREEN })
      }
      const length = this.victim.body.getLinearVelocity().length()
      this.deathLog({ k: 'length', v: length })
      const scale = Math.min(1, length / 10)
      this.deathLog({ k: 'scale', v: scale })
      const halfWidth = maximumBox.getExtents().x * Math.pow(scale, 0.5)
      const halfHeight = maximumBox.getExtents().y * Math.pow(scale, 0.5)
      const minimum = Math.min(halfWidth, halfHeight)
      this.deathLog({ k: 'minimum', v: minimum })
      const sizable = minimum > Death.MINIMUM_SIZE
      if (this.stage.flags.death) {
        const scaledLeft = maximumCenter.x - halfWidth
        const scaledRight = maximumCenter.x + halfWidth
        const scaledTop = maximumCenter.y - halfHeight
        const scaledBottom = maximumCenter.y + halfHeight
        const scaledLower = Vec2(scaledLeft, scaledBottom)
        const scaledUpper = Vec2(scaledRight, scaledTop)
        const scaledBox = new AABB(scaledLower, scaledUpper)
        const color = sizable ? GREEN : RED
        this.stage.debugAABB({ aabb: scaledBox, color, width: 0.15 })
      }
      if (sizable) {
        const center = this.getCenter({
          base: victimPosition,
          debug: this.stage.flags.death,
          halfHeight,
          halfWidth,
          maximum: maximumBox
        })
        const health = Math.max(
          Death.MINIMUM_HEALTH,
          this.victim.actor.gene.stamina * 2
        )
        this.deathLog({ k: 'health', v: health })
        void new Rock({
          halfWidth,
          halfHeight,
          health,
          position: center,
          stage: this.stage
        })
      } else {
        const size = this.victim.radius * Math.SQRT2
        const halfSize = size / 2
        void new Rock({
          halfWidth: halfSize,
          halfHeight: halfSize,
          health: 1,
          position: victimPosition,
          stage: this.stage
        })
      }
      if (this.stage.flags.death) {
        this.stage.runner.paused = true
      }
    }
    super.execute()
  }
}
