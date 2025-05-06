import { Flags } from '../flags'
import { Production } from './production'
import { LayoutData } from '../layout'

export class PrivateProduction extends Production {
  constructor (props: {
    layoutData: LayoutData
  }) {
    super({
      flags: new Flags({
        // performance: false,
        // spawn: true
        // timings: false
      }),
      layoutData: props.layoutData
    })
    // this.addTree({ position: Vec2(-10, -10) })
    // this.addStarTrees()
    // this.addFamilies()
  }
}
