
import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Production } from './production'
import { Promptbook } from '../types'

export class TestProduction extends Production {
  constructor (props: {
    promptbook: Promptbook
  }) {
    const flags = new Flags({
      botChase: true,
      botFlee: true,
      charge: true,
      death: true,
      hungerGame: false,
      performance: false,
      spawn: true,
      visionRangeGame: false,
      controlLines: true
    })
    super({
      flags,
      promptbook: props.promptbook
    })
    this.addHunter({ position: new Vec2(0, 0) })
    // this.addTree({ position: new Vec2(0, 0) })
  }
}
