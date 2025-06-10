import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Organism } from './organism'
import { Gene } from '../gene'
import { PINK, Rgb } from '../../shared/color'

export class Player {
  static INITIAL = 1
  age = 0
  id: string
  organism?: Organism
  seenIds: number[] = []
  stage: Stage

  constructor (props: {
    color: Rgb
    gene: Gene
    health?: number
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
      health: props.health ?? Player.INITIAL,
      player: this,
      position: props.position,
      stage: this.stage
    })
  }

  destroy (): void {
    this.stage.spawner.queue = this.stage.spawner.queue.filter(spawn => spawn.player !== this)
    this.organism?.destroy()
  }

  onStep (props: {
    stepSize: number
  }): void {
    if (this.organism == null) {
      return
    }
    this.age += props.stepSize
    if (this.stage.flags.playerNearest) {
      const features = this.organism.membrane.getFeaturesInRange()
      const sorted = this.organism.sortNearest({ features })
      this.stage.debugLine({
        a: this.organism.membrane.body.getPosition(),
        b: sorted[0].body.getPosition(),
        color: PINK
      })
    }
  }
}
