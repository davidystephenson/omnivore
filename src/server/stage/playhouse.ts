import { Vec2 } from 'planck'
import { YELLOW, RED, PURPLE, ORANGE, BROWN, MAGENTA, PINK, GRAY, CYAN, Rgb } from '../../shared/color'
import { Gene } from '../gene'
import { Organism } from '../actor/organism'
import { Stage } from './stage'
import { Player } from '../actor/player'
import { Tree } from '../actor/tree'
import { StageDef } from '../types'

export class Playhouse extends Stage {
  bottomCenter: Vec2
  bottomLeft: Vec2
  bottomRight: Vec2
  center: Vec2
  centerLeft: Vec2
  centerRight: Vec2
  topCenter: Vec2
  topLeft: Vec2
  topRight: Vec2

  constructor (props: StageDef) {
    super(props)
    this.bottomCenter = Vec2(0, this.halfHeight)
    this.bottomLeft = Vec2(-this.halfWidth, this.halfHeight)
    this.bottomRight = Vec2(this.halfWidth, this.halfHeight)
    this.center = Vec2(0, 0)
    this.centerLeft = Vec2(-this.halfWidth, 0)
    this.centerRight = Vec2(this.halfWidth, 0)
    this.topCenter = Vec2(0, -this.halfHeight)
    this.topLeft = Vec2(-this.halfWidth, -this.halfHeight)
    this.topRight = Vec2(this.halfWidth, -this.halfHeight)
  }

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

  addCenterTree (): void {
    this.addTree({ position: this.center })
  }

  addCornerTrees (): void {
    this.addTree({ position: this.bottomLeft })
    this.addTree({ position: this.bottomRight })
    this.addTree({ position: this.topLeft })
    this.addTree({ position: this.topRight })
  }

  addGridTrees (): void {
    this.addTree({ position: this.bottomCenter })
    this.addTree({ position: this.bottomLeft })
    this.addTree({ position: this.bottomRight })
    this.addTree({ position: this.centerLeft })
    this.addTree({ position: this.center })
    this.addTree({ position: this.centerRight })
    this.addTree({ position: this.topCenter })
    this.addTree({ position: this.topLeft })
    this.addTree({ position: this.topRight })
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

  addPlayer (props: {
    color: Rgb
    id: string
    position: Vec2
    gene: Gene
  }): Player {
    const player = new Player({ stage: this, ...props })
    return player
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

  addStarTrees (): void {
    this.addTree({ position: this.bottomLeft })
    this.addTree({ position: this.bottomRight })
    this.addTree({ position: this.center })
    this.addTree({ position: this.topLeft })
    this.addTree({ position: this.topRight })
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

  addTree (props: {
    position: Vec2
  }): Tree {
    const puppet = new Tree({
      stage: this,
      ...props
    })
    return puppet
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

  addVerticalTrees (): void {
    this.addTree({ position: this.bottomCenter })
    this.addTree({ position: this.topCenter })
  }
}
