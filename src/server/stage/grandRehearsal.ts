import { Vec2 } from 'planck'
import { Flags } from '../flags'
import Procedural from './procedural'

export class GrandRehearsal extends Procedural {
  constructor () {
    const flags = new Flags({
      // death: true,
      // mutation: true,
    })
    super({
      flags,
      halfHeight: 60,
      halfWidth: 60
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.addBalanced({ position: Vec2(45, 45) })
    this.addBully({ position: Vec2(-35, 35) })
    this.addHunter({ position: Vec2(-25, -25) })
    this.addScavenger({ position: Vec2(-15, 15) })
    this.addFly({ position: Vec2(0, -5) })
    this.addTrisolaran({ position: Vec2(15, -15) })
    this.addBrute({ position: Vec2(25, 10) })
    this.addTrapper({ position: Vec2(35, 10) })

    this.addTree({ position: Vec2(20, 20) })
    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, -20) })

    this.saveLayout()
  }
}
