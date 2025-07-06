import { Vec2 } from 'planck'
import { Flags } from '../flags'
import Procedural from './procedural'
import { Initial } from '../types'

export class DressRehearsal extends Procedural {
  constructor (props: {
    promptbookName: string
    onBook: boolean
    initial?: Initial
  }) {
    super({
      flags: new Flags({
        // performance: false,
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
      initial: props.initial,
      onBook: props.onBook,
      promptbookName: props.promptbookName
    })

    this.nature.addApe({ position: Vec2(5, 5) })
    this.nature.addApeBully({ position: Vec2(-5, 5) })
    this.nature.addTiger({ position: Vec2(5, -5) })
    this.nature.addCrow({ position: Vec2(5, -5) })
    this.nature.addTardigrade({ position: Vec2(-5, -5) })
    this.nature.addWhale({ position: Vec2(0, 5) })
    this.nature.addFly({ position: Vec2(5, 0) })
    this.nature.addBoa({ position: Vec2(0, -5) })

    const minimum = Math.min(this.halfWidth, this.halfHeight)
    const half = minimum / 2
    const negative = -half

    this.nature.addTree({ position: Vec2(half, half) })
    this.nature.addTree({ position: Vec2(negative, half) })
    this.nature.addTree({ position: Vec2(half, negative) })
    this.nature.addTree({ position: Vec2(negative, negative) })
    // this.addTree({ position: Vec2(half, half) })
    // this.addTree({ position: Vec2(negative, half) })
    // this.addTree({ position: Vec2(half, negative) })
    // this.addTree({ position: Vec2(negative, negative) })
    // this.addTree({ position: Vec2(half, half) })
    // this.addTree({ position: Vec2(negative, half) })
    // this.addTree({ position: Vec2(half, negative) })
    // this.addTree({ position: Vec2(negative, negative) })
    this.nature.addTree({ position: Vec2(0, 0) })
  }
}
