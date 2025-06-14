import { Vec2 } from 'planck'
import { YELLOW, RED, PURPLE, ORANGE, BROWN, MAGENTA, PINK, GRAY, CYAN } from '../../shared/color'
import { Gene } from '../gene'
import { Organism } from '../actor/organism'
import { Stage } from './stage'

export class Playhouse extends Stage {
  apeGene = new Gene({
    speed: 0.33,
    stage: this,
    stamina: 0.34,
    strength: 0.33
  })

  whaleGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 0,
    strength: 1
  })

  whaleVictimGene = new Gene({
    speed: 0.0,
    stamina: 0.01,
    strength: 0.99,
    stage: this
  })

  apeBullyGene = new Gene({
    speed: 0.33,
    stage: this,
    stamina: 0.33,
    strength: 0.34
  })

  tigerGene = new Gene({
    speed: 0.5,
    stage: this,
    stamina: 0,
    strength: 0.5
  })

  crowGene = new Gene({
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

  playerGene = this.apeGene

  boaGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 0.5,
    strength: 0.5
  })

  tardigradeGene = new Gene({
    speed: 0,
    stage: this,
    stamina: 1,
    strength: 0
  })

  addApe (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: ORANGE,
      gene: this.apeGene,
      position: props.position
    })
  }

  addWhale (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: MAGENTA,
      gene: this.whaleGene,
      position: props.position
    })
  }

  addWhaleVictim (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: CYAN,
      gene: this.whaleVictimGene,
      position: props.position
    })
  }

  addApeBully (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: GRAY,
      gene: this.apeBullyGene,
      position: props.position
    })
  }

  addFamilies (): void {
    // this.addApe({ position: Vec2(45, 45) })
    // this.addTiger({ position: Vec2(-25, -25) })
    // this.addCrow({ position: Vec2(-15, 15) })
    this.addFly({ position: Vec2(0, -5) })
    // this.addTardigrade({ position: Vec2(15, -15) })
    this.addWhale({ position: Vec2(25, 10) })
    // this.addBoa({ position: Vec2(35, 10) })
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

  addTiger (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: RED,
      gene: this.tigerGene,
      position: props.position
    })
  }

  addCrow (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: BROWN,
      gene: this.crowGene,
      position: props.position
    })
  }

  addTardigrade (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: PURPLE,
      gene: this.tardigradeGene,
      position: props.position
    })
  }

  addBoa (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: PINK,
      gene: this.boaGene,
      position: props.position
    })
  }

  addCenterTree (): void {
    this.addTree({ position: Vec2(0, 0) })
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

  addVerticalTrees (): void {
    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const half = minimum / 2

    this.addTree({ position: Vec2(0, half) })
    this.addTree({ position: Vec2(0, -half) })
  }
}
