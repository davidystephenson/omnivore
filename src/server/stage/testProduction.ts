
import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Performance } from './performance'
import { Promptbook } from '../types'

export class TestProduction extends Performance {
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
