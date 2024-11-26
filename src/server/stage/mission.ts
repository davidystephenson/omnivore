import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Playhouse } from './playhouse'

export class Mission extends Playhouse {
  constructor () {
    super({
      flags: new Flags({
        botChase: true,
        botFlee: true,
        charge: true,
        // hungerY: false,
        performance: false,
        // respawn: true,
        visionRangeY: false,
        visionY: false
        // waypointSpawnpointsY: false
      }),
      halfHeight: 20,
      halfWidth: 20
    })
    this.addWall({
      halfWidth: 10,
      halfHeight: 5,
      position: Vec2(5, 13)
    })
    // this.addWall({
    //   halfWidth: 10,
    //   halfHeight: 1,
    //   position: Vec2(-5, -10)
    // })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    // this.addBrick({ position: Vec2(15, 15), halfHeight: 1, halfWidth: 1 })
    // this.addFoodSquare({ position: Vec2(5, 5) })
    // this.addFoodSquare({ position: Vec2(0, -5) })
    // this.addFoodSquare({ position: Vec2(-5, -5) })
    // this.addFoodSquare({ position: Vec2(0, -5) })
    // this.addFoodSquare({ position: Vec2(-5, 0) })
    // this.addFoodSquare({ position: Vec2(-5, 5) })
    // this.addFoodSquare({ position: Vec2(0, 5) })
    // this.addBig({ position: Vec2(7, 7) })
    // this.addStamina({ position: Vec2(5, 0) })
    // this.addSpeed({ position: Vec2(0, 5) })
    // this.addTree({ position: Vec2(10, -10) })
  }
}
