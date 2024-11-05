import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { Gene } from '../gene'
import { Rgb } from '../../shared/color'

export class Player {
  organism?: Organism
  seenIds: number[] = []

  constructor (props: {
    color: Rgb
    gene: Gene
    position: Vec2
    stage: Stage
  }) {
    this.organism = new Organism({
      color: props.color,
      gene: props.gene,
      player: this,
      position: props.position,
      stage: props.stage
    })
  }
}
