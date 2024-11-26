import { Vec2 } from 'planck'
import { Walled } from './walled'
import { YELLOW, RED, PURPLE, ORANGE } from '../../shared/color'
import { Gene } from '../gene'
import { Organism } from '../actor/organism'

export class Playhouse extends Walled {
  balancedGene = new Gene({
    speed: 0.33,
    stage: this,
    stamina: 0.34,
    strength: 0.33
  })

  speedGene = new Gene({
    speed: 1,
    stage: this,
    stamina: 0,
    strength: 0
  })

  staminaGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 1,
    strength: 0
  })

  strengthGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 0,
    strength: 1
  })

  addBalanced (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: ORANGE,
      gene: this.balancedGene,
      position: props.position
    })
  }

  addSpeed (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: YELLOW,
      gene: this.speedGene,
      position: props.position
    })
  }

  addStamina (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: PURPLE,
      gene: this.staminaGene,
      position: props.position
    })
  }

  addStrength (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: RED,
      gene: this.strengthGene,
      position: props.position
    })
  }
}
