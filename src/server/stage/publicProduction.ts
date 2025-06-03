import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PublicProduction extends Performance {
  playerGene = this.apeGene

  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      // performance: true,
      // playerDeath: true,
      respawn: true
      // spawn: true,
      // timings: true
    })
    super({
      flags,
      promptbook: props.promptbook
    })
    this.addFamilies()
    this.addCornerTrees()
    this.addCornerTrees()
    this.addCenterTree()
    this.addCenterTree()
    this.addCenterTree()
  }
}
