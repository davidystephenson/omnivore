import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class SmallPerformance extends Performance {
  playerGene = this.apeGene

  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      // killing: true,
      // timings: true,
      // spawn: true,
      // performance: true,
      // death: true,
      // playerControl: true
      // playerDeath: true,
      // spawnpoints: true
      respawn: true
      // summary: true
      // timings: true
      // tree: true
    })
    super({
      flags,
      promptbook: props.promptbook
    })
    this.addFamilies()
    this.addCenterTree()
    this.addCenterTree()
    this.addCenterTree()
  }
}
