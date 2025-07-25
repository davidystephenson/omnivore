import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Walled } from './walled'
import { Initial } from '../types'

export class Lab extends Walled {
  constructor (props: {
    initial?: Initial
    onBook: boolean
    promptbookName: string
  }) {
    super({
      flags: new Flags({
        // botChase: true,
        // botFlee: true,
        // respawn: true,
        // mutation: true,
        // vision: false,
        visionGame: true
      }),
      halfHeight: 25,
      halfWidth: 25,
      initial: props.initial,
      onBook: props.onBook,
      promptbookName: props.promptbookName
    })
    this.addInnerWall({
      halfWidth: 5,
      halfHeight: 1,
      position: Vec2(-10, -10)
    })
    this.addInnerWall({
      halfWidth: 1,
      halfHeight: 5,
      position: Vec2(-10, 10)
    })
    this.addInnerWall({
      halfWidth: 4,
      halfHeight: 6,
      position: Vec2(10, 10)
    })
    this.addInnerWall({
      halfWidth: 5,
      halfHeight: 5,
      position: Vec2(10, -10)
    })

    this.navigation.setupWaypoints()
    this.spawner.setupSpawnPoints()

    this.nature.tiger.addMember({ position: Vec2(5, -5) })
    this.nature.crow.addMember({ position: Vec2(5, -5) })
    this.nature.tardigrade.addMember({ position: Vec2(-5, -5) })
    this.nature.whale.addMember({ position: Vec2(0, 5) })
    this.nature.fly.addMember({ position: Vec2(5, 0) })
    this.nature.boa.addMember({ position: Vec2(0, -5) })

    this.nature.addTree({ position: Vec2(20, -20) })
    this.nature.addTree({ position: Vec2(-20, -20) })
    this.nature.addTree({ position: Vec2(-20, 20) })
  }
}
