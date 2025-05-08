import { Flags } from '../flags'
import { Production } from './production'
import { Promptbook } from '../types'

export class PrivateProduction extends Production {
  constructor (props: {
    promptbook: Promptbook
  }) {
    super({
      flags: new Flags({
        // performance: false,
        // spawn: true
        // timings: false
      }),
      promptbook: props.promptbook
    })
    // this.addTree({ position: Vec2(-10, -10) })
    // this.addStarTrees()
    // this.addFamilies()
  }
}
