import { Vec2 } from 'planck'
import { Walled } from './walled'
import { YELLOW, RED, PURPLE, ORANGE, BROWN, MAGENTA, PINK, GRAY } from '../../shared/color'
import { Gene } from '../gene'
import { Organism } from '../actor/organism'

export class Playhouse extends Walled {
  balancedGene = new Gene({
    speed: 0.34,
    stage: this,
    stamina: 0.33,
    strength: 0.33
  })

  bullyGene = new Gene({
    speed: 0.33,
    stage: this,
    stamina: 0.33,
    strength: 0.34
  })

  hunterGene = new Gene({
    speed: 0.5,
    stage: this,
    stamina: 0,
    strength: 0.5
  })

  scavengerGene = new Gene({
    speed: 0.5,
    stage: this,
    stamina: 0.5,
    strength: 0
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

  trapperGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 0.5,
    strength: 0.5
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

  addBully (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: GRAY,
      gene: this.bullyGene,
      position: props.position
    })
  }

  addHunter (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: RED,
      gene: this.hunterGene,
      position: props.position
    })
  }

  addScavenger (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: BROWN,
      gene: this.scavengerGene,
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
      color: MAGENTA,
      gene: this.strengthGene,
      position: props.position
    })
  }

  addTrapper (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: PINK,
      gene: this.trapperGene,
      position: props.position
    })
  }
}
