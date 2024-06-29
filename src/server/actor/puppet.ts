import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Sculpture } from '../feature/triangle'

export class Puppet extends Actor {
  triangle: Sculpture

  constructor (props: {
    stage: Stage
    vertices: Vec2[] // [Vec2, Vec2, Vec2]
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'puppet' })
    this.triangle = new Sculpture({
      position: props.position,
      vertices: props.vertices,
      actor: this
    })
    this.invincibleTime = 0.1
    this.features.push(this.triangle)
  }

  onStep (): void {
    super.onStep()
  }
}
