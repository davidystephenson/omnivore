import { Vec2 } from 'planck'
import { Tree } from '../server/tree'
import { Walled } from '../server/walled'

export class Funhouse extends Walled {
  constructor () {
    super({
      debugBotChase: true,
      debugBotFlee: true,
      halfHeight: 50,
      halfWidth: 50
    })

    // this.addBrick({ halfHeight: 10, halfWidth: 1, position: Vec2(brickX, 16) })

    // Wall Group
    this.addWalls({
      halfWidth: 1,
      halfHeight: 1,
      position: Vec2(-10, 15),
      count: 10,
      gap: 0.1
    })

    // Big wall
    // this.addWall({
    //   halfWidth: 5,
    //   halfHeight: 10,
    //   position: Vec2(10, 15)
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

    this.navigation.setupWaypoints()
    this.addPuppet({
      vertices: [
        Vec2(-5, 10),
        Vec2(5, 10),
        Vec2(0, -10)
      ],
      position: Vec2(0, 15)
    })
    // Puppet Group
    this.addPuppets({
      count: 10,
      spacing: 2.1,
      vertices: [
        Vec2(-5, 1),
        Vec2(5, 0),
        Vec2(-5, -1)
      ],
      position: Vec2(15, 15)
    })
    // Wide bricks
    // this.addBricks({
    //   count: 10,
    //   gap: 0.1,
    //   halfHeight: 1,
    //   halfWidth: propHalfWidth,
    //   position: Vec2(rightPropX, -20)
    // })

    // Big brick

    // Big puppet
    this.addPuppet({
      vertices: [
        Vec2(5, 15),
        Vec2(-5, 0),
        Vec2(5, -15)
      ],
      position: Vec2(0, -25)
    })
    this.addBrick({
      // angle: Math.PI * 0.9,
      halfHeight: 6,
      halfWidth: 1,
      position: Vec2(-12, 15)
    })

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
    this.addBricks({
      angle: Math.PI * 0.6,
      count: 10,
      gap: 0.1,
      halfHeight: 0.5,
      halfWidth: 5,
      position: Vec2(15, 15)
    })
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
    const smallTree = new Tree({
      radius: 0.6
    })
    this.addBot({
      position: Vec2(-8, 0),
      tree: smallTree
    })
    // this.addBot({
    //   position: Vec2(-13, 0),
    //   tree: smallTree
    // })
    // this.addBot({
    //   position: Vec2(-18, 0),
    //   tree: smallTree
    // })
    // this.addBot({
    //   position: Vec2(-23, 0),
    //   tree: smallTree
    // })
    const bigTree = new Tree({
      radius: 1.2
    })
    this.addBot({
      position: Vec2(-5, 0),
      tree: bigTree
    })
    // this.addBot({
    //   position: Vec2(-10, 0),
    //   tree: bigTree
    // })
    // this.addBot({
    //   position: Vec2(-15, 0),
    //   tree: bigTree
    // })
    // this.addBot({
    //   position: Vec2(-20, 0),
    //   tree: bigTree
    // })
  }
}
