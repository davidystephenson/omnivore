import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Walled } from './walled'

export class Mission extends Walled {
  playerGene = this.flyGene

  constructor () {
    super({
      flags: new Flags({
        // botChase: true,
        // botFlee: true,
        // botPath: true,
        charge: true,
        // controlLines: true,
        // damage: true,
        // death: true,
        // hungerGame: false,
        // meatY: false,
        // navigation: true,
        performance: false,
        // playerNavigation: false,
        reproduceGame: false,
        // respawn: true,
        // spawn: true
        // timings: false,
        // visionRangeGame: false,
        // visionGame: false,
        // waypointSpawnpointsY: false
        waypoints: true
      }),
      halfHeight: 7,
      halfWidth: 30
    })
    this.addWall({
      position: Vec2(5, 0),
      halfHeight: 3,
      halfWidth: 1,
      outer: false
    })
    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()
    this.addBrute({ position: Vec2(25, 0) })
    this.addFruit({ position: Vec2(-5, 0) })

    // this.addBrick({ position: Vec2(20, -20), halfHeight: 5, halfWidth: 5 })
    // this.addBrick({ position: Vec2(25, -20), halfHeight: 1, halfWidth: 1 })
    // this.addBrick({ position: Vec2(15, -5), halfHeight: 5, halfWidth: 5 })
    // this.addPuppet({
    //   position: Vec2(10, -10),
    //   vertices: [
    //     Vec2(-5, 5),
    //     Vec2(5, 5),
    //     Vec2(0, -5)
    //   ],
    //   force: Vec2(0, 0),
    //   speed: 10
    // })
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
    // this.addTree({ position: Vec2(10, -10) })
    // this.addScavenger({ position: Vec2(0, 0) })
    // this.addHunter({ position: Vec2(0, 0) })
    // this.addTrisolaran({ position: Vec2(10, 10) })
    this.saveLayout()
  }
}
