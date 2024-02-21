import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Barrier } from '../feature/barrier'

export class Wall extends Actor {
  barrier: Barrier
  constructor (props: {
    stage: Stage
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'wall' })
    this.barrier = new Barrier({
      position: props.position,
      halfHeight: props.halfHeight,
      halfWidth: props.halfWidth,
      actor: this
    })
    this.features.push(this.barrier)
  }
}
