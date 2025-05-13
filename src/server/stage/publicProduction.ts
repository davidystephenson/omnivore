import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Production } from './production'

export class PublicProduction extends Production {
  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      // killingGame: false,
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
