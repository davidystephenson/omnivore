import { Vec2 } from 'planck'
import { Sculpture } from '../feature/sculpture'
import { Stage } from '../stage/stage'
import { Actor } from './actor'
import { Serving } from '../feature/serving'

export class Food extends Actor {
  static NUTRITION = 0.15
  nutrition: number
  serving: Sculpture

  constructor (props: {
    stage: Stage
    vertices: Vec2[]
    nutrition?: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'food' })
    const nutrition = props.nutrition ?? Food.NUTRITION
    this.nutrition = Math.min(nutrition, 1)
    this.serving = new Serving({
      position: props.position,
      vertices: props.vertices,
      actor: this
    })
    this.serving.combatDamage = 1 - this.nutrition
    this.features.push(this.serving)
    this.stage.food.push(this)
  }
}
