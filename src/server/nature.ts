import { Vec2 } from 'planck'
import { YELLOW, RED, PURPLE, PINK, GRAY, Rgb, LIGHT_GRAY, LIGHT_RED, LIGHT_PURPLE, LIGHT_YELLOW, LIGHT_PINK, LIGHT_ORANGE, ORANGE } from '../shared/color'
import { Stage } from './stage/stage'
import { Tree } from './actor/tree'
import { River } from './actor/river'
import { range, shuffle } from './math'
import { Food } from './actor/food'
import { Rock } from './actor/rock'
import Family from './family'

export class Nature {
  boa: Family
  crow: Family
  fly: Family
  tardigrade: Family
  tiger: Family
  whale: Family
  families: Family[] = []
  stage: Stage

  constructor (props: {
    stage: Stage
  }) {
    this.stage = props.stage
    // this.ape = this.addFamily({
    //   color: GREEN,
    //   highlight: LIME
    //   // speed: 0.33,
    //   // strength: 0.33,
    //   // stamina: 0.34,
    // })
    this.boa = this.addFamily({
      color: PURPLE,
      highlight: LIGHT_PURPLE
      // speed: 0
      // stamina: 0.5,
      // strength: 0.5
    })
    this.crow = this.addFamily({
      color: ORANGE,
      highlight: LIGHT_ORANGE
      // speed: 0.5,
      // strength: 0,
      // stamina: 0.5,
    })
    this.fly = this.addFamily({
      color: YELLOW,
      highlight: LIGHT_YELLOW
      // speed: 1,
      // stamina: 0,
      // strength: 0
    })
    this.tardigrade = this.addFamily({
      color: PINK,
      highlight: LIGHT_PINK
      // speed: 0,
      // stamina: 1,
      // strength: 0
    })
    this.tiger = this.addFamily({
      color: RED,
      highlight: LIGHT_RED
      // speed: 0.5,
      // strength: 0.5,
      // stamina: 0,
    })
    this.whale = this.addFamily({
      color: GRAY,
      highlight: LIGHT_GRAY
      // speed: 0,
      // strength: 1,
      // stamina: 0,
    })
    this.families = shuffle(this.families)
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

  addFamily (props: {
    color: Rgb
    highlight: Rgb
  }): Family {
    const family = new Family({ stage: this.stage, ...props })
    this.families.push(family)
    return family
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
    this.addTree({ position: Vec2(0, 0) })
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

  spawnFamilies (props: {
    count: number
  }): void {
    for (let i = 0; i < props.count; i++) {
      const family = this.families[i]
      family.spawn()
    }
  }
}
