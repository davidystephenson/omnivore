import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Playhouse } from './playhouse'

export class Rehearsal extends Playhouse {
  constructor () {
    super({
      flags: new Flags({
        // botChase: true,
        // botFlee: true,
        // respawn: true,
        // mutation: true,
        // vision: false,
        // visionY: false
      }),
      halfHeight: 25,
      halfWidth: 25
    })
    this.addWall({
      halfWidth: 5,
      halfHeight: 1,
      position: Vec2(-10, -10)
    })
    this.addWall({
      halfWidth: 1,
      halfHeight: 5,
      position: Vec2(-10, 10)
    })
    this.addWall({
      halfWidth: 4,
      halfHeight: 6,
      position: Vec2(10, 10)
    })
    this.addWall({
      halfWidth: 5,
      halfHeight: 5,
      position: Vec2(10, -10)
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.addBalanced({ position: Vec2(5, 5) })
    this.addBully({ position: Vec2(-5, 5) })
    this.addHunter({ position: Vec2(5, -5) })
    this.addScavenger({ position: Vec2(5, -5) })
    this.addStamina({ position: Vec2(-5, -5) })
    this.addStrength({ position: Vec2(0, 5) })
    this.addSpeed({ position: Vec2(5, 0) })
    this.addTrapper({ position: Vec2(0, -5) })

    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, 20) })
  }
}
