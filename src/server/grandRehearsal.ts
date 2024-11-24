import { Vec2 } from 'planck'
import { Flags } from './flags'
import { Playhouse } from './playhouse'

export class GrandRehearsal extends Playhouse {
  constructor () {
    const flags = new Flags({
      visionY: false
    })
    super({
      flags,
      halfHeight: 40,
      halfWidth: 40
    })
    this.addWall({
      halfWidth: 20,
      halfHeight: 5,
      position: Vec2(-15, -15)
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.addBig({ position: Vec2(5, 10) })
    this.addBig({ position: Vec2(10, 20) })

    this.addSmall({ position: Vec2(-10, -20) })
    this.addSmall({ position: Vec2(-10, -15) })
    this.addSmall({ position: Vec2(-10, -10) })
    this.addSmall({ position: Vec2(-10, -5) })
    this.addSmall({ position: Vec2(-10, 5) })
    this.addSmall({ position: Vec2(-10, 10) })

    this.addTree({ position: Vec2(20, 20) })
    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
  }
}
