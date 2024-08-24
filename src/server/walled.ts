import { Vec2 } from 'planck'
import { Stage } from './stage'

export class Walled extends Stage {
  constructor (props: {
    debugBotChase?: boolean
    debugBotFlee?: boolean
    debugWaypoints?: boolean
    halfHeight: number
    halfWidth: number
  }) {
    super(props)
    // Right wall
    // this.addWall({
    //   halfWidth: this.halfWidth,
    //   halfHeight: 1,
    //   position: Vec2(0, this.halfWidth + 1)
    // })
    // this.addWall({
    //   halfWidth: this.halfWidth,
    //   halfHeight: 1,
    //   position: Vec2(0, -this.halfWidth - 1)
    // })
    // this.addWall({
    //   halfWidth: 1,
    //   halfHeight: this.halfHeight,
    //   position: Vec2(this.halfHeight + 1, 0)
    // })
    // this.addWall({
    //   halfWidth: 1,
    //   halfHeight: this.halfHeight,
    //   position: Vec2(-this.halfHeight - 1, 0)
    // })
  }
}
