import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PublicProduction extends Performance {
  playerGene = this.balancedGene

  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      // killing: true,
      timings: true,
      // spawn: true,
      // performance: false,
      // death: true,
      playerControl: true
      // playerDeath: true
    })
    super({
      flags,
      promptbook: props.promptbook
    })
    this.addGridTrees()
    // this.addGridTrees()
    this.addFamilies()
    this.addCornerTrees()
  }
}
