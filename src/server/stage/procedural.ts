import { Vec2 } from 'planck'
import { Wall } from '../actor/wall'
import { Playhouse } from './playhouse'
import { Flags } from '../flags'

export interface Rectangle {
  x: number
  y: number
  halfWidth: number
  halfHeight: number
}

export default class Procedural extends Playhouse {
  static FILL = 0.5
  static FAILS = 100000
  static DEBUG = 10000

  debugging = false
  fails = 0
  proceduralWalls: Wall[] = []

  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
  }) {
    super(props)

    while (!this.isDone()) {
      const remainder = this.fails % Procedural.DEBUG
      this.debugging = remainder === 0
      if (this.debugging) {
        const fill = this.getFill()
        const percent = fill * 100
        const percentFixed = percent.toFixed(2)
        const percentString = `${percentFixed}%`
        console.info('Proceeding...', this.fails, percentString)
      }
      this.guardWall()
    }
  }

  getCoordinate (props: {
    halfSize: number
  }): number {
    const size = props.halfSize
    const difference = size - this.navigation.margin
    const maximum = difference * 2
    const random = this.getRandom({ maximum })
    const coordinate = random - difference
    return coordinate
  }

  getFill (): number {
    const wallsHalfArea = this.walls.reduce((sum, wall) => {
      const halfArea = wall.halfHeight * wall.halfWidth
      const total = sum + halfArea
      return total
    }, 0)
    const halfArea = this.halfHeight * this.halfWidth
    const fill = wallsHalfArea / halfArea
    return fill
  }

  getRandom (props: {
    minimum?: number
    maximum: number
  }): number {
    const difference = props.maximum - this.navigation.margin
    const random = Math.random()
    const scaled = random * difference
    const shifted = this.navigation.margin + scaled
    return shifted
  }

  getRectangle (): Rectangle {
    const x = this.getX()
    const y = this.getY()
    const halfHeight = this.getSize()
    const halfWidth = this.getSize()
    const rectangle = {
      x,
      y,
      halfHeight,
      halfWidth
    }
    if (this.flags.procedural && this.debugging) {
      console.debug('rectangle', rectangle)
    }
    return rectangle
  }

  getSize (): number {
    const margins = this.navigation.margin * 2
    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const difference = minimum - margins
    const maximum = difference / 2
    const size = this.getRandom({ maximum })
    return size
  }

  getX (): number {
    const x = this.getCoordinate({
      halfSize: this.halfWidth
    })
    return x
  }

  getY (): number {
    const y = this.getCoordinate({
      halfSize: this.halfHeight
    })
    return y
  }

  guardRectangle (): Rectangle | undefined {
    const rectangle = this.getRectangle()
    const blocked = this.walls.some((wall) => {
      const blocked = this.isBlocked({ rectangle, wall })
      return blocked
    })
    if (blocked) {
      this.fails += 1
      return undefined
    }
    return rectangle
  }

  guardWall (): void {
    const rectangle = this.guardRectangle()
    if (rectangle == null) {
      return
    }
    const position = Vec2(rectangle.x, rectangle.y)
    const wall = this.addWall({
      halfWidth: rectangle.halfWidth,
      halfHeight: rectangle.halfHeight,
      position
    })
    this.proceduralWalls.push(wall)
  }

  isBlocked (props: {
    rectangle: Rectangle
    wall: Wall
  }): boolean {
    const xDist = Math.abs(props.rectangle.x - props.wall.position.x)
    const xSpread = props.rectangle.halfWidth + props.wall.halfWidth + this.navigation.margin
    const yDist = Math.abs(props.rectangle.y - props.wall.position.y)
    const ySpread = props.rectangle.halfHeight + props.wall.halfHeight + this.navigation.margin
    const blocked = xDist < xSpread && yDist < ySpread
    if (blocked && this.flags.procedural && this.debugging) {
      console.log('blocking wall:')
      console.log('position:', props.wall.position)
      console.log('halfWidth:', props.wall.halfWidth)
      console.log('halfHeight:', props.wall.halfHeight)
      console.log('margin:', this.navigation.margin)
    }
    return blocked
  }

  isDone (): boolean {
    const failed = this.isFailed()
    if (failed) {
      return true
    }
    const full = this.isFull()
    return full
  }

  isFailed (): boolean {
    const failed = this.fails >= Procedural.FAILS
    if (failed) {
      console.info('Procedure complete!')
    }
    return failed
  }

  isFull (): boolean {
    const fill = this.getFill()
    const full = fill > Procedural.FILL
    return full
  }
}
