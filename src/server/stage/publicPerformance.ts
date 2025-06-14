import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PublicPerformance extends Performance {
  playerGene = this.apeGene

  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      // performance: true,
      // playerDeath: true
      respawn: true,
      // spawn: true,
      stats: true
      // timings: true
    })
    super({
      flags,
      promptbook: props.promptbook
    })
    this.addFamilies()
    this.addStarTrees()
  }
}
