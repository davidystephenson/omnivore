import { Flags } from '../flags'
import { LayoutData } from '../layout'
import { Production } from './production'

export class PublicProduction extends Production {
  constructor (props: {
    layoutData: LayoutData
  }) {
    super({
      flags: new Flags({
        // killingGame: false,
        // timings: true,
        // spawn: true
      }),
      layoutData: props.layoutData
    })
    this.addStarTrees()
    this.addFamilies()
  }
}
