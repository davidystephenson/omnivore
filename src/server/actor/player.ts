import { Stage } from '../stage/stage'
import { Organism } from './organism'
import { PINK } from '../../shared/color'

export class Player {
  age = 0
  ageCache = 0
  extinct = false
  points = 0
  id: string
  organism?: Organism
  seenIds: number[] = []
  stage: Stage

  constructor (props: {
    id: string
    stage: Stage
  }) {
    this.id = props.id
    this.stage = props.stage
    this.stage.players.set(this.id, this)
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
    const roundAge = Math.floor(this.age)
    if (this.ageCache < roundAge) {
      this.points += this.age
      this.ageCache = roundAge
    }
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
