import { Flags } from '../flags'
import Procedural from './procedural'

export class Rehearsal extends Procedural {
  constructor () {
    super({
      flags: new Flags({
        // botChase: true,
        // botFlee: true,
        // mutation: true,
        // respawn: true,
        // timings: true
        // vision: false,
        performance: false
      }),
      halfHeight: 35,
      halfWidth: 35
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    // this.addHunter({ position: Vec2(5, -5) })
    // this.addScavenger({ position: Vec2(5, -5) })
    // this.addBrute({ position: Vec2(0, 5) })
    // this.addFly({ position: Vec2(5, 0) })
    // this.addTrapper({ position: Vec2(0, -5) })

    // this.addTree({ position: Vec2(20, -20) })
    // this.addTree({ position: Vec2(-20, -20) })
    // this.addTree({ position: Vec2(-20, 20) })
  }
}
