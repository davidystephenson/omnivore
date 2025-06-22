import { Vec2 } from 'planck'
import { Flags } from '../flags'
import Procedural from './procedural'
import { MainIndex } from '../types'
import readWallDefs from '../readWallDefs'

export class DressRehearsal extends Procedural {
  constructor (props?: {
    promptbookName: string
    onBook: boolean
    main: MainIndex
  }) {
    super({
      flags: new Flags({
        // performance: false,
        // navAreas: true,
        // navigation: true,
        // organismsCount: true,
        // botChase: true,
        // botPath: true,
        // controlLines: true,
        // charge: true,
        timings: true
        // waypoints: true
      }),
      halfHeight: 80,
      halfWidth: 80,
      main: props?.main
    })

    if (props != null) {
      const wallDefs = readWallDefs({
        promptbookName: props.promptbookName,
        onBook: props.onBook,
        wallCount: props.main.wallCount
      })
      this.buildWalls({ wallDefs })
    } else {
      const wallDefs = this.walls.map(wall => wall.getDef())
      this.manager.saveMany({
        data: wallDefs,
        path: 'promptbooks/output/wallDefs'
      })
    }

    this.navigation.setupWaypoints({
      main: props?.main
    })
    this.spawner.setupSpawnPoints()

    this.addApe({ position: Vec2(5, 5) })
    this.addApeBully({ position: Vec2(-5, 5) })
    this.addTiger({ position: Vec2(5, -5) })
    this.addCrow({ position: Vec2(5, -5) })
    this.addTardigrade({ position: Vec2(-5, -5) })
    this.addWhale({ position: Vec2(0, 5) })
    this.addFly({ position: Vec2(5, 0) })
    this.addBoa({ position: Vec2(0, -5) })

    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const half = minimum / 2
    const negative = -half

    this.addTree({ position: Vec2(half, half) })
    this.addTree({ position: Vec2(negative, half) })
    this.addTree({ position: Vec2(half, negative) })
    this.addTree({ position: Vec2(negative, negative) })
    // this.addTree({ position: Vec2(half, half) })
    // this.addTree({ position: Vec2(negative, half) })
    // this.addTree({ position: Vec2(half, negative) })
    // this.addTree({ position: Vec2(negative, negative) })
    // this.addTree({ position: Vec2(half, half) })
    // this.addTree({ position: Vec2(negative, half) })
    // this.addTree({ position: Vec2(half, negative) })
    // this.addTree({ position: Vec2(negative, negative) })
    this.addTree({ position: Vec2(0, 0) })
  }
}
