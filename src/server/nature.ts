import { Vec2 } from 'planck'
import { YELLOW, RED, PURPLE, ORANGE, BROWN, MAGENTA, PINK, GRAY, CYAN, Rgb } from '../shared/color'
import { Gene } from './gene'
import { Organism } from './actor/organism'
import { Stage } from './stage/stage'
import { Tree } from './actor/tree'
import { River } from './actor/river'
import { range } from './math'
import { Food } from './actor/food'
import { Rock } from './actor/rock'

export class Nature {
  apeGene: Gene
  apeBullyGene: Gene
  boaGene: Gene
  crowGene: Gene
  flyGene: Gene
  flyBullyGene: Gene
  playerGene: Gene
  stage: Stage
  tardigradeGene: Gene
  tigerGene: Gene
  whaleGene: Gene
  whaleVictimGene: Gene

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
    this.apeGene = new Gene({
      speed: 0.33,
      stage: this.stage,
      stamina: 0.34,
      strength: 0.33
    })

    this.whaleGene = new Gene({
      speed: 0,
      stage: this.stage,
      stamina: 0,
      strength: 1
    })

    this.whaleVictimGene = new Gene({
      speed: 0.0,
      stamina: 0.01,
      strength: 0.99,
      stage: this.stage
    })

    this.apeBullyGene = new Gene({
      speed: 0.33,
      stage: this.stage,
      stamina: 0.33,
      strength: 0.34
    })

    this.tigerGene = new Gene({
      speed: 0.5,
      stage: this.stage,
      stamina: 0,
      strength: 0.5
    })

    this.crowGene = new Gene({
      speed: 0.5,
      stage: this.stage,
      stamina: 0.5,
      strength: 0
    })

    this.flyGene = new Gene({
      speed: 1,
      stage: this.stage,
      stamina: 0,
      strength: 0
    })

    this.flyBullyGene = new Gene({
      speed: 0.99,
      stage: this.stage,
      stamina: 0,
      strength: 0.01
    })

    this.playerGene = this.apeGene

    this.boaGene = new Gene({
      speed: 0,
      stage: this.stage,
      stamina: 0.5,
      strength: 0.5
    })

    this.tardigradeGene = new Gene({
      speed: 0,
      stage: this.stage,
      stamina: 1,
      strength: 0
    })
  }

  addApe (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: ORANGE,
      gene: this.apeGene,
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
    const minimum = Math.min(this.stage.halfWidth, this.stage.halfHeight)
    const half = minimum / 2
    const negative = -half

    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(negative, negative) })
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

  addFamilies (): void {
    this.addApe({ position: Vec2(45, 45) })
    this.addTiger({ position: Vec2(-25, -25) })
    this.addCrow({ position: Vec2(-15, 15) })
    this.addFly({ position: Vec2(-25, -25) })
    this.addTardigrade({ position: Vec2(15, -15) })
    this.addWhale({ position: Vec2(25, 25) })
    this.addBoa({ position: Vec2(35, 10) })
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

  addFood (props: {
    color?: Rgb
    nutrition?: number
    position: Vec2
    vertices: Vec2[]
  }): Food {
    const food = new Food({ stage: this.stage, ...props })
    return food
  }

  addFoodSquare (props: {
    color?: Rgb
    halfSize: number
    nutrition?: number
    position: Vec2
  }): Food {
    const y0 = 0 - props.halfSize
    const y1 = 0 + props.halfSize
    const x0 = 0 - props.halfSize
    const x1 = 0 + props.halfSize
    const vertices = [
      Vec2(x0, y0),
      Vec2(x1, y0),
      Vec2(x1, y1),
      Vec2(x0, y1)
    ]
    return this.addFood({
      color: props.color,
      position: props.position,
      nutrition: props.nutrition,
      vertices
    })
  }

  // TODO Compare to tree food size
  addFruit (props: {
    position: Vec2
  }): Food {
    return this.addFoodSquare({
      halfSize: 1.25,
      position: props.position
    })
  }

  addGridTrees (): void {
    const minimum = Math.min(this.stage.halfWidth, this.stage.halfHeight)
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

  addOrganism (props: {
    color: Rgb
    position: Vec2
    gene: Gene
  }): Organism {
    const organism = new Organism({ stage: this.stage, ...props })
    return organism
  }

  addRock (props: {
    angle?: number
    halfHeight: number
    halfWidth: number
    position: Vec2
  }): Rock {
    const rock = new Rock({ stage: this.stage, ...props })
    return rock
  }

  addRocks (props: {
    angle?: number
    count: number
    gap: number
    halfHeight: number
    halfWidth: number
    position: Vec2
  }): void {
    const rockRange = range(1, props.count)
    const indexOffset = (props.count) / 2
    const height = props.halfHeight * 2
    const offsetHeight = height + props.gap
    rockRange.forEach(index => {
      const offsetIndex = index - indexOffset
      const offset = offsetHeight * offsetIndex
      const position = props.position.clone()
      position.y += offset
      this.addRock({
        angle: props.angle,
        halfHeight: props.halfHeight,
        halfWidth: props.halfWidth,
        position
      })
    })
  }

  addRiver (props: {
    vertices: [Vec2, Vec2, Vec2]
    position: Vec2
    force: Vec2
    speed: number
  }): River {
    const river = new River({ stage: this.stage, ...props })
    return river
  }

  addRivers (props: {
    count: number
    spacing: number
    vertices: [Vec2, Vec2, Vec2]
    position: Vec2
  }): void {
    const riverRange = range(1, props.count)
    const indexOffset = (props.count - 1) / 2
    riverRange.forEach(index => {
      const offsetIndex = index - indexOffset
      const offset = props.spacing * offsetIndex
      const position = props.position.clone()
      position.y += offset
      this.addRiver({ vertices: props.vertices, position, force: Vec2(0, 0), speed: 0 })
    })
  }

  addStarTrees (): void {
    const minimum = Math.min(this.stage.halfWidth, this.stage.halfHeight)
    const half = minimum / 2
    const negative = -half

    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(negative, negative) })
    this.addTree({ position: Vec2(negative, negative) })
    this.addTree({ position: Vec2(negative, negative) })
    // this.addTree({ position: Vec2(0, 0) })
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

  addTiger (props: {
    position: Vec2
  }): Organism {
    return this.addOrganism({
      color: RED,
      gene: this.tigerGene,
      position: props.position
    })
  }

  addTree (props: {
    position: Vec2
  }): Tree {
    const puppet = new Tree({
      stage: this.stage,
      ...props
    })
    return puppet
  }

  addVerticalTrees (): void {
    const minimum = Math.min(this.stage.halfWidth, this.stage.halfHeight)
    const half = minimum / 2

    this.addTree({ position: Vec2(0, half) })
    this.addTree({ position: Vec2(0, -half) })
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
}
