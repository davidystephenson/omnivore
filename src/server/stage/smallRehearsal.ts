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
      halfHeight: 25,
      halfWidth: 25,
      initial: props.initial,
      onBook: props.onBook,
      promptbookName: props.promptbookName
    })

    this.nature.addCrow({ position: Vec2(5, -5) })
    this.nature.addWhale({ position: Vec2(0, 5) })
    this.nature.addFly({ position: Vec2(5, 0) })
    this.nature.addBoa({ position: Vec2(0, -5) })

    this.nature.addTree({ position: Vec2(20, -20) })
    this.nature.addTree({ position: Vec2(-20, -20) })
    this.nature.addTree({ position: Vec2(-20, 20) })
  }
}
