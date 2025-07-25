import { Vec2 } from 'planck'
import { Stage } from '../stage/stage'
import { Organism } from './organism'
import { PINK } from '../../shared/color'
import { Gene } from '../gene'

export class Player {
  static INITIAL = 1
  age = 0
  ageCache = 0
  points = 0
  id: string
  organism?: Organism
  seenIds: number[] = []
  stage: Stage

  constructor (props: {
    gene?: Gene
    health?: number
    id: string
    position?: Vec2
    stage: Stage
  }) {
    this.id = props.id
    this.stage = props.stage
    this.stage.players.set(this.id, this)
    const family = this.stage.nature.players.find(family => family.members.size === 0)
    if (family == null) {
      throw new Error('There is no available family')
    }
    this.organism = family.addMember({
      gene: props.gene,
      health: props.health ?? Player.INITIAL,
      player: this,
      position: props.position
    })
    this.organism.player = this
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
