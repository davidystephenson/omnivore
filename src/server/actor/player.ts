import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { Gene } from '../gene'
import { Rgb } from '../../shared/color'

export class Player extends Organism {
  seenIds: number[] = []

  constructor (props: {
    color: Rgb
    gene: Gene
    position: Vec2
    stage: Stage
  }) {
    super({
      color: props.color,
      gene: props.gene,
      position: props.position,
      stage: props.stage
    })
  }
}
