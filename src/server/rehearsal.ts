import { Vec2 } from 'planck'
import { Flags } from './flags'
import { Playhouse } from './playhouse'

export class Rehearsal extends Playhouse {
  constructor () {
    super({
      flags: new Flags({
        botChase: true,
        botFlee: true,
        respawn: true,
        vision: false
      }),
      halfHeight: 40,
      halfWidth: 40
    })
    this.addWall({
      halfWidth: 10,
      halfHeight: 5,
      position: Vec2(-15, -15)
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.addBig({ position: Vec2(0, 10) })
    this.addBig({ position: Vec2(0, 20) })
    this.addBig({ position: Vec2(-10, -10) })
    this.addBig({ position: Vec2(20, 20) })

    this.addSmall({ position: Vec2(-10, 15) })
    this.addSmall({ position: Vec2(-10, 20) })
    this.addSmall({ position: Vec2(-10, 25) })
    this.addSmall({ position: Vec2(-10, 30) })
    this.addSmall({ position: Vec2(-10, 35) })
    this.addSmall({ position: Vec2(-10, 35) })

    this.addTree({ position: Vec2(20, 20) })
    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
  }
}
