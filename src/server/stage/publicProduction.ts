import { Flags } from '../flags'
import { Production } from './production'

export class PublicProduction extends Production {
  constructor () {
    super({
      flags: new Flags({
        // killingGame: false,
        // timings: true,
        // spawn: true
      })
    })
    this.addStarTrees()
    this.addFamilies()
  }
}
