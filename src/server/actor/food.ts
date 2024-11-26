import { Vec2 } from 'planck'
import { Sculpture } from '../feature/sculpture'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { GREEN } from '../../shared/color'

export class Food extends Actor {
  static nutrition = 0.1
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
      color: GREEN,
      actor: this
    })
    this.sculpture.combatDamage = 0.99999999999
    this.features.push(this.sculpture)
    this.stage.food.push(this)
  }

  onStep (props: {
    stepSize: number
  }): void {
    super.onStep({ stepSize: props.stepSize })
  }
}
