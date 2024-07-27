import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'

export class Player extends Organism {
  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({
      stage: props.stage,
      position: props.position
    })
  }
}
