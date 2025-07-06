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

    this.nature.addApe({ position: Vec2(45, 45) })
    this.nature.addApeBully({ position: Vec2(-35, 35) })
    this.nature.addTiger({ position: Vec2(-25, -25) })
    this.nature.addCrow({ position: Vec2(-15, 15) })
    this.nature.addFly({ position: Vec2(0, -5) })
    this.nature.addTardigrade({ position: Vec2(15, -15) })
    this.nature.addWhale({ position: Vec2(25, 10) })
    this.nature.addBoa({ position: Vec2(35, 10) })

    this.nature.addTree({ position: Vec2(20, 20) })
    this.nature.addTree({ position: Vec2(20, -20) })
    this.nature.addTree({ position: Vec2(-20, -20) })
    this.nature.addTree({ position: Vec2(-20, -20) })
  }
}
