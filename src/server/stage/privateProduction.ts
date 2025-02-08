import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Production } from './production'

export class PrivateProduction extends Production {
  constructor () {
    super({
      flags: new Flags({
        performance: true,
        timings: true
      })
    })
    this.addTree({ position: Vec2(-10, -10) })
    // this.addStarTrees()
    // this.addFamilies()
  }
}
