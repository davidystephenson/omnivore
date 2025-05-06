
import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Production } from './production'
import { LayoutData } from '../layout'

export class TestProduction extends Production {
  constructor (props: {
    layoutData: LayoutData
  }) {
    super({
      flags: new Flags({
        botChase: true,
        botFlee: true,
        charge: true,
        death: true,
        hungerGame: false,
        performance: false,
        spawn: true,
        visionRangeGame: false,
        controlLines: true
      }),
      layoutData: props.layoutData
    })
    this.addHunter({ position: new Vec2(0, 0) })
    // this.addTree({ position: new Vec2(0, 0) })
  }
}
