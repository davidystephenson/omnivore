import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PublicProduction extends Performance {
  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      killing: true,
      timings: true
      // spawn: true,
      // performance: false
    })
    super({
      flags,
      promptbook: props.promptbook
    })
    this.addGridTrees()
    this.addFamilies()
  }
}
