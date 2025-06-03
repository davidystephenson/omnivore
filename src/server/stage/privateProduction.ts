import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PrivateProduction extends Performance {
  playerGene = this.apeGene

  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      performance: true,
      // playerControl: true
      // playerDeath: true,
      // spawnpoints: true,
      // respawn: true,
      // summary: true
      timings: true
    })
    super({
      flags,
      promptbook: props.promptbook
    })
    this.addFamilies()
    this.addStarTrees()
    // this.addStarTrees()
  }
}
