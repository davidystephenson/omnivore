import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Playhouse } from './playhouse'
import { MainIndex } from '../types'

export class Walled extends Playhouse {
  static SIZE = 100
  static HALF_SIZE = Walled.SIZE / 2
  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
    main?: MainIndex
  }) {
    super(props)
    if (props.main != null) {
      console.info('Deferring outer walls...')
      return
    }
    this.addOuterWall({
      halfWidth: this.halfWidth + Walled.SIZE,
      halfHeight: Walled.HALF_SIZE,
      position: Vec2(0, this.halfHeight + Walled.HALF_SIZE)
    })
    this.addOuterWall({
      halfWidth: this.halfWidth + Walled.SIZE,
      halfHeight: Walled.HALF_SIZE,
      position: Vec2(0, -this.halfHeight - Walled.HALF_SIZE)
    })
    this.addOuterWall({
      halfWidth: Walled.HALF_SIZE,
      halfHeight: this.halfHeight + Walled.SIZE,
      position: Vec2(this.halfWidth + Walled.HALF_SIZE, 0)
    })
    this.addOuterWall({
      halfWidth: Walled.HALF_SIZE,
      halfHeight: this.halfHeight + Walled.SIZE,
      position: Vec2(-this.halfWidth - Walled.HALF_SIZE, 0)
    })
  }
}
