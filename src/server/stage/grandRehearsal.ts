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

    this.addApe({ position: Vec2(45, 45) })
    this.addApeBully({ position: Vec2(-35, 35) })
    this.addTiger({ position: Vec2(-25, -25) })
    this.addCrow({ position: Vec2(-15, 15) })
    this.addFly({ position: Vec2(0, -5) })
    this.addTardigrade({ position: Vec2(15, -15) })
    this.addWhale({ position: Vec2(25, 10) })
    this.addBoa({ position: Vec2(35, 10) })

    this.addTree({ position: Vec2(20, 20) })
    this.addTree({ position: Vec2(20, -20) })
    this.addTree({ position: Vec2(-20, -20) })
    this.addTree({ position: Vec2(-20, -20) })

    this.saveLayout()
  }
}
