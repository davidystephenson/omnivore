import { Vec2 } from 'planck'
import { Flags } from '../flags'
import Procedural from './procedural'
import { Initial } from '../types'

export class GrandRehearsal extends Procedural {
  constructor (props: {
    initial?: Initial
    promptbookName: string
    onBook: boolean
  }) {
    const flags = new Flags({
      // death: true,
      // mutation: true,
    })
    super({
      flags,
      halfHeight: 60,
      halfWidth: 60,
      initial: props.initial,
      onBook: props.onBook,
      promptbookName: props.promptbookName
    })
    this.nature.spawnFamilies({ count: 5 })
    this.nature.addTree({ position: Vec2(20, 20) })
    this.nature.addTree({ position: Vec2(20, -20) })
    this.nature.addTree({ position: Vec2(-20, -20) })
    this.nature.addTree({ position: Vec2(-20, -20) })
  }
}
