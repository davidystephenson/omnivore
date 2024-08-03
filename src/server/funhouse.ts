import { Vec2 } from 'planck'
import { HALF_SIGHT_WIDTH } from '../shared/sight'
import { Walled } from '../server/walled'

export class Funhouse extends Walled {
  constructor () {
    super({
      halfHeight: 50,
      halfWidth: 50
    })

    this.navigation.setupWaypoints()
    const brickX = -14 + HALF_SIGHT_WIDTH - 0.1
    const propHalfWidth = HALF_SIGHT_WIDTH - 5
    const wallHalfWidth = HALF_SIGHT_WIDTH - 1.1
    const rightPropX = brickX + 1.25 + propHalfWidth
    const leftPropX = brickX - 1.25 - propHalfWidth
    // this.addBrick({ halfHeight: 10, halfWidth: 1, position: Vec2(brickX, 16) })
    this.addPuppet({
      vertices: [
        Vec2(-5, 10),
        Vec2(5, 10),
        Vec2(0, -10)
      ],
      position: Vec2(brickX, 15)
    })

    // Wall Group
    this.addWalls({
      halfWidth: 1,
      halfHeight: 1,
      position: Vec2(-10, 15),
      count: 10,
      gap: 0.1
    })

    // Big puppet
    this.addPuppet({
      vertices: [
        Vec2(propHalfWidth, 15),
        Vec2(-propHalfWidth, 0),
        Vec2(propHalfWidth, -15)
      ],
      position: Vec2(0, -15)
    })

    // Big wall
    // this.addWall({
    //   halfWidth: 5,
    //   halfHeight: 10,
    //   position: Vec2(10, 15)
    // })

    // Wide bricks
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: propHalfWidth,
    //   position: Vec2(rightPropX, -20)
    // })

    // Big brick
    // this.addBrick({
    //   // angle: Math.PI * 0.9,
    //   halfHeight: 6,
    //   halfWidth: 1,
    //   position: Vec2(leftPropX, 15)
    // })

    // Angled bricks
    // this.addBricks({
    //   angle: Math.PI * 0.75,
    //   count: 10,
    //   gap: 0.5,
    //   halfHeight: 0.5,
    //   halfWidth: propHalfWidth - 3,
    //   position: Vec2(rightPropX, 10)
    // })

    // Tight Angled bricks
    // this.addBricks({
    //   angle: Math.PI * 0.6,
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 0.5,
    //   halfWidth: propHalfWidth - 3,
    //   position: Vec2(rightPropX - 2, 10)
    // })

    // Misaligned walls
    // this.addWalls({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(-20, 16)
    // })
    // this.addWalls({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(-14, 15)
    // })

    // Misaligned bricks
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(rightPropX, 15)
    // })
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(rightPropX - 5, 16)
    // })

    // Aligned walls
    // this.addWalls({
    //   count: 8,
    //   gap: 0.1,
    //   halfHeight: 0.5,
    //   halfWidth: 0.5,
    //   position: Vec2(-10, 15)
    // })
    // this.addWalls({
    //   count: 8,
    //   gap: 0.1,
    //   halfHeight: 0.5,
    //   halfWidth: 0.5,
    //   position: Vec2(-5, 15)
    // })

    // Aligned bricks
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(leftPropX, 16)
    // })
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: 1,
    //   position: Vec2(leftPropX + 5, 16)
    // })

    // Aligned puppets
    // this.addPuppets({
    //   count: 10,
    //   spacing: 2,
    //   vertices: [
    //     Vec2(-propHalfWidth, 0.8),
    //     Vec2(propHalfWidth, 0),
    //     Vec2(-propHalfWidth, -0.8)
    //   ],
    //   position: Vec2(rightPropX, 15)
    // })
    // this.addPuppets({
    //   count: 10,
    //   spacing: 2,
    //   vertices: [
    //     Vec2(propHalfWidth, 0.8),
    //     Vec2(-propHalfWidth, 0),
    //     Vec2(propHalfWidth, -0.8)
    //   ],
    //   position: Vec2(rightPropX, 16)
    // })

    // Misaligned puppets
    // this.addPuppets({
    //   count: 2,
    //   spacing: 10.1,
    //   vertices: [
    //     Vec2(-1, 5),
    //     Vec2(1, 0),
    //     Vec2(-1, -5)
    //   ],
    //   position: Vec2(leftPropX - 5, 15)
    // })
    // this.addPuppets({
    //   count: 2,
    //   spacing: 10.1,
    //   vertices: [
    //     Vec2(-1, 5),
    //     Vec2(1, 0),
    //     Vec2(-1, -5)
    //   ],
    //   position: Vec2(leftPropX, 16.5)
    // })

    // Puppet Group
    // this.addPuppets({
    //   count: 10,
    //   spacing: 2.1,
    //   vertices: [
    //     Vec2(-propHalfWidth, 1),
    //     Vec2(propHalfWidth, 0),
    //     Vec2(-propHalfWidth, -1)
    //   ],
    //   position: Vec2(rightPropX, 15)
    // })
  }
}
