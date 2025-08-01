import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Initial } from '../types'
import Procedural from './procedural'

export class SmallRehearsal extends Procedural {
  constructor (props: {
    initial?: Initial
    onBook: boolean
    promptbookName: string
  }) {
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
      halfHeight: 30,
      halfWidth: 30,
      initial: props.initial,
      onBook: props.onBook,
      promptbookName: props.promptbookName
    })

    this.nature.crow.addMember({ position: Vec2(5, -5) })
    this.nature.whale.addMember({ position: Vec2(0, 5) })
    this.nature.fly.addMember({ position: Vec2(5, 0) })
    this.nature.boa.addMember({ position: Vec2(0, -5) })

    this.nature.addTree({ position: Vec2(20, -20) })
    this.nature.addTree({ position: Vec2(-20, -20) })
    this.nature.addTree({ position: Vec2(-20, 20) })
  }
}
