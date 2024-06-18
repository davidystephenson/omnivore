import { Vec2 } from 'planck'
import { Stage } from './stage'

export class Walled extends Stage {
  constructor () {
    super()
    // outer walls
    this.addWall({ halfWidth: this.halfWidth, halfHeight: 1, position: Vec2(0, this.halfWidth) })
    this.addWall({ halfWidth: this.halfWidth, halfHeight: 1, position: Vec2(0, -this.halfWidth) })
    this.addWall({ halfWidth: 1, halfHeight: this.halfHeight, position: Vec2(this.halfHeight, 0) })
    this.addWall({ halfWidth: 1, halfHeight: this.halfHeight, position: Vec2(-this.halfHeight, 0) })
  }
}
