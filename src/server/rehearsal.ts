import { Vec2 } from 'planck'
import { Walled } from './walled'

export class Rehearsal extends Walled {
  constructor () {
    super({
      halfHeight: 10,
      halfWidth: 10
    })

    // inner walls
    // this.addWall({ halfWidth: 30, halfHeight: 5, position: Vec2(0, 10) })
    // this.addWall({ halfWidth: 30, halfHeight: 5, position: Vec2(0, -10) })
    // this.addWall({ halfWidth: 15, halfHeight: 15, position: Vec2(20, 0) })
    // this.addWall({ halfWidth: 15, halfHeight: 15, position: Vec2(-20, 0) })
    // this.addBrick({ halfWidth: 40, halfHeight: 10, position: Vec2(0, 35) })
    // this.addBrick({ halfWidth: 40, halfHeight: 10, position: Vec2(0, -35) })

    this.addOrganism({
      position: Vec2(-8, 0)
    })
    // this.addBrick({
    //   halfHeight: 6,
    //   halfWidth: 17,
    //   position: Vec2(0, 11)
    // })
    // this.addBrick({
    //   halfHeight: 4,
    //   halfWidth: 2,
    //   position: Vec2(-16, 0)
    // })
    // this.addBrick({
    //   halfHeight: 6,
    //   halfWidth: 17,
    //   position: Vec2(0, -11)
    // })

    // void new Brick({ stage: this, halfWidth: 1, halfHeight: 2, position: Vec2(-5, 0) })
    // this.addWall({ halfWidth: 0.5, halfHeight: 3, position: Vec2(-2, 0) })
    // void new Brick({ stage: this, halfWidth: 2, halfHeight: 1, position: Vec2(2, 3) })
    // this.addWall({ halfWidth: 1, halfHeight: 6, position: Vec2(5, 3) })
  }
}
