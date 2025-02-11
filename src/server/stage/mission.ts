import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Walled } from './walled'

export class Mission extends Walled {
  constructor () {
    super({
      flags: new Flags({
        botChase: true,
        botFlee: true,
        charge: true,
        damage: true,
        death: true,
        hungerGame: false,
        // meatY: false,
        performance: false,
        reproduceGame: false,
        // respawn: true,
        timings: false,
        visionRangeGame: false,
        visionGame: false,
        // waypointSpawnpointsY: false
        controlLines: true
      }),
      halfHeight: 20,
      halfWidth: 20
    })
    this.addInnerWall({
      halfWidth: 10,
      halfHeight: 3,
      position: Vec2(5, 12)
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()
    // this.addBully({ position: Vec2(5, 5) })

    this.addBrick({ position: Vec2(15, -5), halfHeight: 5, halfWidth: 5 })
    this.addPuppet({
      position: Vec2(10, -10),
      vertices: [
        Vec2(-5, 5),
        Vec2(5, 5),
        Vec2(0, -5)
      ],
      force: Vec2(0, 0),
      speed: 10
    })
    // this.addFoodSquare({ position: Vec2(5, 5) })
    // this.addFoodSquare({ position: Vec2(0, -5) })
    // this.addFoodSquare({ position: Vec2(-5, -5) })
    // this.addFoodSquare({ position: Vec2(0, -5) })
    // this.addFoodSquare({ position: Vec2(-5, 0) })
    // this.addFoodSquare({ position: Vec2(-5, 5) })
    // this.addFoodSquare({ position: Vec2(0, 5) })
    // this.addBruteVictim({ position: Vec2(7, 7) })
    // this.addTrapper({ position: Vec2(5, 0) })
    // this.addSpeed({ position: Vec2(0, 5) })
    this.addTree({ position: Vec2(10, -10) })
    // this.addScavenger({ position: Vec2(0, 0) })
    // this.addHunter({ position: Vec2(0, 0) })
    // this.addTrisolaran({ position: Vec2(10, 10) })
    this.saveLayout()
  }
}
