import { Vec2 } from 'planck'
import { Walled } from './walled'
import { YELLOW, RED } from '../../shared/color'
import { Gene } from '../gene'
import { Organism } from '../actor/organism'

export class Playhouse extends Walled {
  bigGene = new Gene({
    radius: this.navigation.radii[0]
  })

  smallGene = new Gene({
    radius: this.navigation.radii[this.navigation.radii.length - 1]
  })

  addBig (props: {
    position: Vec2
  }): Organism {
    return this.addBot({
      color: RED,
      gene: this.bigGene,
      position: props.position
    })
  }

  addSmall (props: {
    position: Vec2
  }): Organism {
    return this.addBot({
      color: YELLOW,
      gene: this.smallGene,
      position: props.position
    })
  }
}
