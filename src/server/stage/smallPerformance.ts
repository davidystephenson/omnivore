import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class SmallPerformance extends Performance {
  constructor (props: {
    promptbook: Promptbook
    promptbookName: string
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
      hungerGame: false,
      respawn: true
      // summary: true
      // timings: true
      // tree: true
    })
    super({
      flags,
      promptbook: props.promptbook,
      promptbookName: props.promptbookName
    })
    this.nature.addFamilies()
    // this.nature.addCenterTree()
    // this.nature.addCenterTree()
    // this.nature.addCenterTree()
  }
}
