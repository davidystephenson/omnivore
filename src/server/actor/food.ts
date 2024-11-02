import { Vec2 } from 'planck'
import { Sculpture } from '../feature/sculpture'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Color } from '../../shared/color'

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
      color: Color.GREEN,
      actor: this
    })
    this.sculpture.health = 0.1
    this.features.push(this.sculpture)
    this.stage.food.push(this)
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
  }
}
