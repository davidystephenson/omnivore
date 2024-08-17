import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { Gene } from '../gene'

export class Player extends Organism {
  constructor (props: {
    position: Vec2
    stage: Stage
    gene: Gene
  }) {
    super({
      position: props.position,
      stage: props.stage,
      gene: props.gene
    })
  }
}
