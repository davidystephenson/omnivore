import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Walled } from './walled'

export class Lab extends Walled {
  constructor () {
    super({
      flags: new Flags({
        // botChase: true,
        // botFlee: true,
        // respawn: true,
        // mutation: true,
        // vision: false,
        visionGame: true
      }),
      halfHeight: 25,
      halfWidth: 25
    })
    this.addInnerWall({
      halfWidth: 5,
      halfHeight: 1,
      position: Vec2(-10, -10)
    })
    this.addInnerWall({
      halfWidth: 1,
      halfHeight: 5,
      position: Vec2(-10, 10)
    })
    this.addInnerWall({
      halfWidth: 4,
      halfHeight: 6,
      position: Vec2(10, 10)
    })
    this.addInnerWall({
      halfWidth: 5,
      halfHeight: 5,
      position: Vec2(10, -10)
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.addApe({ position: Vec2(5, 5) })
    this.addApeBully({ position: Vec2(-5, 5) })
    this.addTiger({ position: Vec2(5, -5) })
    this.addCrow({ position: Vec2(5, -5) })
    this.addTardigrade({ position: Vec2(-5, -5) })
    this.addWhale({ position: Vec2(0, 5) })
    this.addFly({ position: Vec2(5, 0) })
    this.addBoa({ position: Vec2(0, -5) })

    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, 20) })

    this.saveLayout()
  }
}
