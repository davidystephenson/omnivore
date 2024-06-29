import { AABB, Vec2 } from 'planck'
import { SIGHT } from '../shared/sight'
import { Membrane } from './feature/membrane'
import { Stage } from './stage'
import { Death } from './death'
import { Brick } from './actor/brick'

export class Starvation extends Death {
  stage: Stage
  victim: Membrane

  constructor (props: { stage: Stage, victim: Membrane }) {
    super({ stage: props.stage, victim: props.victim })
    this.stage = props.stage
    this.victim = props.victim
    console.debug('construct starvation')
  }

  execute (props?: {
    debug?: boolean
  }): void {
    if (props?.debug === true) {
      console.debug('Killing.execute')
    }
    const victimPosition = this.victim.body.getPosition()
    const lookLowerBound = Vec2(victimPosition.x - SIGHT.x, victimPosition.y - SIGHT.y)
    const lookUpperBound = Vec2(victimPosition.x + SIGHT.x, victimPosition.y + SIGHT.y)
    const lookBox = new AABB(lookLowerBound, lookUpperBound)
    const brickBox = this.trim({ base: victimPosition, lookBox })
    this.stage.log({ value: ['lookBox', lookBox] })
    this.stage.log({ value: ['brickBox', brickBox] })
    const halfWidth = brickBox.getExtents().x
    const halfHeight = brickBox.getExtents().y
    const brickPosition = brickBox.getCenter()
    if (Math.min(halfWidth, halfHeight) > 0) {
      void new Brick({ halfWidth, halfHeight, position: brickPosition, stage: this.stage })
      this.stage.log({ value: 'increment respawnQueue' })
      this.stage.respawnQueue.push(this.victim.actor)
    }
  }
}
