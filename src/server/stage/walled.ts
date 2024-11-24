import { Vec2 } from 'planck'
import { Stage } from './stage'
import { Flags } from '../flags'

export class Walled extends Stage {
  constructor (props: {
    flags: Flags
    halfHeight: number
    halfWidth: number
  }) {
    super(props)
    this.addWall({
      halfWidth: this.halfWidth + 20,
      halfHeight: 20,
      position: Vec2(0, this.halfWidth + 21)
    })
    this.addWall({
      halfWidth: this.halfWidth + 20,
      halfHeight: 20,
      position: Vec2(0, -this.halfWidth - 21)
    })
    this.addWall({
      halfWidth: 20,
      halfHeight: this.halfHeight + 20,
      position: Vec2(this.halfHeight + 21, 0)
    })
    this.addWall({
      halfWidth: 20,
      halfHeight: this.halfHeight + 20,
      position: Vec2(-this.halfHeight - 21, 0)
    })
  }
}
