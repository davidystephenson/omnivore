import { Vec2 } from 'planck'
import { Sculpture } from '../feature/sculpture'
import { Stage } from '../stage'
import { Actor } from './actor'

export class Food extends Actor {
  sculpture: Sculpture

  constructor (props: {
    stage: Stage
    vertices: Vec2[]
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'food' })
    this.sculpture = new Sculpture({
      position: props.position,
      vertices: props.vertices,
      actor: this
    })
    this.features.push(this.sculpture)
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
  }
}
