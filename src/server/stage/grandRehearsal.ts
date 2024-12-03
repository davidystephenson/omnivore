import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Playhouse } from './playhouse'

export class GrandRehearsal extends Playhouse {
  constructor () {
    const flags = new Flags({
      // death: true,
      // mutation: true,
      visionY: false
    })
    super({
      flags,
      halfHeight: 50,
      halfWidth: 50
    })
    this.addWall({
      halfWidth: 10,
      halfHeight: 1,
      position: Vec2(-10, -10)
    })
    this.addWall({
      halfWidth: 5,
      halfHeight: 1,
      position: Vec2(-20, 10)
    })
    this.addWall({
      halfWidth: 1,
      halfHeight: 10,
      position: Vec2(10, 10)
    })
    this.addWall({
      halfWidth: 1,
      halfHeight: 1,
      position: Vec2(10, 20)
    })

    this.addWall({
      halfWidth: 1,
      halfHeight: 10,
      position: Vec2(20, 10)
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.addBalanced({ position: Vec2(45, 45) })
    this.addBully({ position: Vec2(-35, 35) })
    this.addHunter({ position: Vec2(-25, -25) })
    this.addScavenger({ position: Vec2(-15, 15) })
    this.addSpeed({ position: Vec2(0, -5) })
    this.addStamina({ position: Vec2(15, -15) })
    this.addStrength({ position: Vec2(25, 10) })
    this.addTrapper({ position: Vec2(35, 10) })

    this.addTree({ position: Vec2(20, 20) })
    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
  }
}
