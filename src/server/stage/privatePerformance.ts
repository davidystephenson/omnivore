import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PrivatePerformance extends Performance {
  constructor (props: {
    promptbook: Promptbook
    promptbookName: string
  }) {
    const flags = new Flags({
      // performance: true,
      // playerControl: true
      // playerDeath: true,
      // spawnpoints: true,
      respawn: true
      // summary: true
      // timings: true
    })
    super({
      flags,
      promptbook: props.promptbook,
      promptbookName: props.promptbookName
    })
    this.nature.spawnFamilies({ count: 5 })
    this.nature.addStarTrees()
    this.nature.addStarTrees()
  }
}
