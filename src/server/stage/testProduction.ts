
import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Production } from './production'

export class TestProduction extends Production {
  constructor () {
    super({
      flags: new Flags({
        botChase: true,
        botFlee: true,
        charge: true,
        death: true,
        hungerGame: false,
        performance: false,
        respawn: true,
        visionRangeGame: false,
        controlLines: true
      })
    })
    this.addHunter({ position: new Vec2(0, 0) })
    // this.addTree({ position: new Vec2(0, 0) })
  }
}
