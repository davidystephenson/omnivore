import { Vec2 } from 'planck'
import { Walled } from './walled'

export class Rehearsal extends Walled {
  constructor () {
    super({
      halfHeight: 50,
      halfWidth: 50
    })

    // inner walls
    this.addWall({ halfWidth: 30, halfHeight: 5, position: Vec2(0, 15) })
    this.addWall({ halfWidth: 5, halfHeight: 20, position: Vec2(-30, -10) })
    this.addWall({ halfWidth: 5, halfHeight: 20, position: Vec2(30, -10) })
    this.navigation.setupWaypoints()

    this.addPuppet({
      vertices: [
        Vec2(10, 15),
        Vec2(-10, 0),
        Vec2(10, -15)
      ],
      position: Vec2(25, 25)
    })
    this.addBrick({ halfWidth: 5, halfHeight: 5, position: Vec2(0, -10) })
    // this.addBrick({ halfWidth: 40, halfHeight: 10, position: Vec2(0, -35) })

    this.addBot({
      position: Vec2(-8, 0)
    })
    // // this.addBrick({
    // //   halfHeight: 6,
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
