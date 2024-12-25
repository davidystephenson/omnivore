import { Vec2 } from 'planck'
import { Flags } from '../flags'
import Procedural from './procedural'

export class DressRehearsal extends Procedural {
  constructor () {
    super({
      flags: new Flags({
        // performance: false,
        visionY: false,
        // botChase: true,
        // botPath: true,
        controlLines: true,
        // charge: true,
        timings: true
      }),
      halfHeight: 50,
      halfWidth: 50
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

    this.addTree({ position: Vec2(0, 0) })
    // this.addTree({ position: Vec2(-20, -20) })
    // this.addTree({ position: Vec2(-20, 20) })
  }
}
