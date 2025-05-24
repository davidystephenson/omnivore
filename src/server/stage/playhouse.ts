import { Vec2 } from 'planck'
import { YELLOW, RED, PURPLE, ORANGE, BROWN, MAGENTA, PINK, GRAY, CYAN } from '../../shared/color'
import { Gene } from '../gene'
import { Organism } from '../actor/organism'
import { Stage } from './stage'

export class Playhouse extends Stage {
  balancedGene = new Gene({
    speed: 0.34,
    stage: this,
    stamina: 0.33,
    strength: 0.33
  })

  bruteGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 0,
    strength: 1
  })

  bruteVictimGene = new Gene({
    speed: 0.0,
    stamina: 0.01,
    strength: 0.99,
    stage: this
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

  flyGene = new Gene({
    speed: 1,
    stage: this,
    stamina: 0,
    strength: 0
  })

  flyBullyGene = new Gene({
    speed: 0.99,
    stage: this,
    stamina: 0,
    strength: 0.01
  })

  playerGene = this.balancedGene

  trapperGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 0.5,
    strength: 0.5
  })

  trisolaranGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 1,
    strength: 0
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

  addBrute (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: MAGENTA,
      gene: this.bruteGene,
      position: props.position
    })
  }

  addBruteVictim (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: CYAN,
      gene: this.bruteVictimGene,
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

  addFly (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: YELLOW,
      gene: this.flyGene,
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

  addTrisolaran (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: PURPLE,
      gene: this.trisolaranGene,
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

  addCornerTrees (): void {
    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const half = minimum / 2
    const negative = -half

    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(negative, negative) })
  }

  addGridTrees (): void {
    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const half = minimum / 2
    const negative = -half

    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(0, negative) })
    this.addTree({ position: Vec2(0, half) })
    this.addTree({ position: Vec2(half, 0) })
    this.addTree({ position: Vec2(negative, 0) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(negative, negative) })
    this.addTree({ position: Vec2(0, 0) })
  }

  addStarTrees (): void {
    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const half = minimum / 2
    const negative = -half

    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(negative, negative) })
    this.addTree({ position: Vec2(0, 0) })
  }

  addFamilies (): void {
    this.addBalanced({ position: Vec2(45, 45) })
    this.addBully({ position: Vec2(-35, 35) })
    this.addHunter({ position: Vec2(-25, -25) })
    this.addScavenger({ position: Vec2(-15, 15) })
    this.addFly({ position: Vec2(0, -5) })
    this.addTrisolaran({ position: Vec2(15, -15) })
    this.addBrute({ position: Vec2(25, 10) })
    this.addTrapper({ position: Vec2(35, 10) })
  }
}
