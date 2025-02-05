import { Flags } from '../flags'
import { Production } from './production'

export class PrivateProduction extends Production {
  constructor () {
    super({
      flags: new Flags({
        mutation: true,
        performance: true,
        timings: true
      })
    })
    this.addStarTrees()
    this.addFamilies()
  }
}
