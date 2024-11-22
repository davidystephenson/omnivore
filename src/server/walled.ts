import { Vec2 } from 'planck'
import { Stage } from './stage'
import { DebugFlags } from './debugFlags'

export class Walled extends Stage {
  constructor (props: {
    flags: DebugFlags
    halfHeight: number
    halfWidth: number
  }) {
    super(props)
    this.addWall({
      halfWidth: this.halfWidth,
      halfHeight: 1,
      position: Vec2(0, this.halfWidth + 1)
    })
    this.addWall({
      halfWidth: this.halfWidth,
      halfHeight: 1,
      position: Vec2(0, -this.halfWidth - 1)
    })
    this.addWall({
      halfWidth: 1,
      halfHeight: this.halfHeight,
      position: Vec2(this.halfHeight + 1, 0)
    })
    this.addWall({
      halfWidth: 1,
      halfHeight: this.halfHeight,
      position: Vec2(-this.halfHeight - 1, 0)
    })
  }
}
