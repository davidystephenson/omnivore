import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Playhouse } from './playhouse'

export class Walled extends Playhouse {
  static SIZE = 100
  static HALF_SIZE = Walled.SIZE / 2
  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
  }) {
    super(props)
    this.addWall({
      halfWidth: this.halfWidth + Walled.SIZE,
      halfHeight: Walled.HALF_SIZE,
      position: Vec2(0, this.halfHeight + Walled.HALF_SIZE)
    })
    this.addWall({
      halfWidth: this.halfWidth + Walled.SIZE,
      halfHeight: Walled.HALF_SIZE,
      position: Vec2(0, -this.halfHeight - Walled.HALF_SIZE)
    })
    this.addWall({
      halfWidth: Walled.HALF_SIZE,
      halfHeight: this.halfHeight + Walled.SIZE,
      position: Vec2(this.halfHeight + Walled.HALF_SIZE, 0)
    })
    this.addWall({
      halfWidth: Walled.HALF_SIZE,
      halfHeight: this.halfHeight + Walled.SIZE,
      position: Vec2(-this.halfHeight - Walled.HALF_SIZE, 0)
    })
  }
}
