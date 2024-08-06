import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Sculpture } from '../feature/sculpture'

export class Puppet extends Actor {
  sculpture: Sculpture

  constructor (props: {
    stage: Stage
    vertices: Vec2[] // [Vec2, Vec2, Vec2]
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'puppet' })
    this.sculpture = new Sculpture({
      position: props.position,
      vertices: props.vertices,
      actor: this
    })
    this.invincibleTime = 0.1
    this.features.push(this.sculpture)
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
  }
}
