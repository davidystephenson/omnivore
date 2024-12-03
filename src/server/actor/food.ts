import { Vec2 } from 'planck'
import { Sculpture } from '../feature/sculpture'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { GREEN } from '../../shared/color'

export class Food extends Actor {
  static NUTRITION = 0.1
  nutrition: number
  sculpture: Sculpture

  constructor (props: {
    stage: Stage
    vertices: Vec2[]
    nutrition?: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'food' })
    this.nutrition = props.nutrition ?? Food.NUTRITION
    this.sculpture = new Sculpture({
      position: props.position,
      vertices: props.vertices,
      color: GREEN,
      actor: this
    })
    this.sculpture.combatDamage = 1 - this.nutrition
    this.features.push(this.sculpture)
    this.stage.food.push(this)
  }
}
