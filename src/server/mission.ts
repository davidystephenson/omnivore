import { Vec2 } from 'planck'
import { Flags } from './flags'
import { Playhouse } from './playhouse'

export class Mission extends Playhouse {
  constructor () {
    super({
      flags: new Flags({
        botChase: true,
        botFlee: true,
        charge: true,
        hungerY: false,
        respawn: true
      }),
      halfHeight: 20,
      halfWidth: 20
    })
    this.addWall({
      halfWidth: 10,
      halfHeight: 1,
      position: Vec2(5, 10)
    })
    // this.addWall({
    //   halfWidth: 10,
    //   halfHeight: 1,
    //   position: Vec2(-5, -10)
    // })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.addBig({ position: Vec2(7, 7) })
    this.addTree({ position: Vec2(10, -10) })
  }
}
