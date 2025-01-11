import { Vec2 } from 'planck'
import { Flags } from '../flags'
import Procedural from './procedural'

export class DressRehearsal extends Procedural {
  constructor () {
    super({
      flags: new Flags({
        // performance: false,
        visionY: false
        // navAreas: true,
        // navigation: true,
        // organismsCount: true,
        // botChase: true,
        // botPath: true,
        // controlLines: true,
        // charge: true,
        // timings: true,
        // waypoints: true
      }),
      halfHeight: 30,
      halfWidth: 30
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    // this.addBalanced({ position: Vec2(5, 5) })
    // this.addBully({ position: Vec2(-5, 5) })
    // this.addHunter({ position: Vec2(5, -5) })
    // this.addScavenger({ position: Vec2(5, -5) })
    // this.addStamina({ position: Vec2(-5, -5) })
    // this.addStrength({ position: Vec2(0, 5) })
    // this.addSpeed({ position: Vec2(5, 0) })
    // this.addTrapper({ position: Vec2(0, -5) })

    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const half = minimum / 2
    console.log('half', half)
    const negative = -half

    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(negative, negative) })
  }
}
