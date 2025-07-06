import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Initial, WaypointData } from '../types'
import { Stage } from './stage'

export class Walled extends Stage {
  static SIZE = 100
  static HALF_SIZE = Walled.SIZE / 2
  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
    initial?: Initial
    onBook: boolean
    promptbookName: string
    waypointDatas?: WaypointData[]
  }) {
    super(props)
    if (props.initial != null) {
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
