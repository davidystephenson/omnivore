import { Vec2 } from 'planck'
import { Wall } from '../actor/wall'
import { Flags } from '../flags'
import { Walled } from './walled'

export interface Rectangle {
  x: number
  y: number
  halfWidth: number
  halfHeight: number
}

export default class Procedural extends Walled {
  static FILL = 0.1
  static FAILS = 100000
  static DEBUG = 10000

  debugging = false
  fails = 0
  treeRectangles: Rectangle[] = []

  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
  }) {
    super(props)
    console.info('Initiating procedure for', props.halfWidth, 'x', props.halfHeight)

    while (!this.isDone()) {
      const remainder = this.fails % Procedural.DEBUG
      this.debugging = remainder === 0
      if (this.debugging) {
        const fill = this.getFillString()
        console.info('Proceeding...', this.fails, fill)
      }
      this.guardWall()
    }

    const fill = this.getFillString()
    console.info(`Proceeded with ${fill}% and`, this.walls.length, 'walls after', this.fails, 'fails')
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
    const wallsHalfArea = this.walls.reduce((wallsHalfArea, wall) => {
      if (wall.outer) {
        return wallsHalfArea
      }
      const halfArea = wall.halfHeight * wall.halfWidth
      const total = wallsHalfArea + halfArea
      return total
    }, 0)
    const halfArea = this.halfHeight * this.halfWidth
    const fill = wallsHalfArea / halfArea
    return fill
  }

  getFillString (): string {
    const fill = this.getFill()
    const percent = fill * 100
    const percentFixed = percent.toFixed(2)
    const percentString = `${percentFixed}%`
    return percentString
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
      const blocked = this.isBlockedByWall({ rectangle, wall })
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
    this.addInnerWall({
      halfWidth: rectangle.halfWidth,
      halfHeight: rectangle.halfHeight,
      position
    })
  }

  isBlocked (props: {
    halfHeight: number
    halfWidth: number
    rectangle: Rectangle
    x: number
    y: number
  }): boolean {
    const xDist = Math.abs(props.rectangle.x - props.x)
    const xSpread = props.rectangle.halfWidth + props.halfWidth + this.navigation.margin
    const yDist = Math.abs(props.rectangle.y - props.y)
    const ySpread = props.rectangle.halfHeight + props.halfHeight + this.navigation.margin
    const blocked = xDist < xSpread && yDist < ySpread
    if (blocked && this.flags.procedural && this.debugging) {
      this.debug({ v: 'blocking wall' })
      this.debug({ k: 'x:', v: props.y })
      this.debug({ k: 'y:', v: props.x })
      this.debug({ k: 'halfWidth:', v: props.halfWidth })
      this.debug({ k: 'halfHeight:', v: props.halfHeight })
      this.debug({ k: 'margin:', v: this.navigation.margin })
    }
    return blocked
  }

  isBlockedByWall (props: {
    rectangle: Rectangle
    wall: Wall
  }): boolean {
    const blocked = this.isBlocked({
      halfHeight: props.wall.halfHeight,
      halfWidth: props.wall.halfWidth,
      rectangle: props.rectangle,
      x: props.wall.position.x,
      y: props.wall.position.y
    })
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
