import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Organism } from './organism'
import { Gene } from '../gene'
import { Rgb } from '../../shared/color'

export class Player {
  age = 0
  id: string
  organism?: Organism
  seenIds: number[] = []
  stage: Stage

  constructor (props: {
    color: Rgb
    gene: Gene
    id: string
    position: Vec2
    stage: Stage
  }) {
    this.id = props.id
    this.stage = props.stage
    this.stage.players.set(this.id, this)
    this.organism = new Organism({
      color: props.color,
      gene: props.gene,
      player: this,
      position: props.position,
      stage: this.stage
    })
  }

  onStep (props: {
    stepSize: number
  }): void {
    this.age += props.stepSize
  }
}
