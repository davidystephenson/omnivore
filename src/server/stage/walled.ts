import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Playhouse } from './playhouse'

export class Walled extends Playhouse {
  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
  }) {
    super(props)
    this.addWall({
      halfWidth: this.halfWidth,
      halfHeight: 1,
      position: Vec2(0, this.halfWidth)
    })
    this.addWall({
      halfWidth: this.halfWidth,
      halfHeight: 1,
      position: Vec2(0, -this.halfWidth)
    })
    this.addWall({
      halfWidth: 1,
      halfHeight: this.halfHeight,
      position: Vec2(this.halfHeight, 0)
    })
    this.addWall({
      halfWidth: 1,
      halfHeight: this.halfHeight,
      position: Vec2(-this.halfHeight, 0)
    })
  }
}
