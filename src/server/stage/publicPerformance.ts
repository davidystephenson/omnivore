import { Vec2 } from 'planck'
import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PublicPerformance extends Performance {
  constructor (props: {
    promptbook: Promptbook
    promptbookName: string
  }) {
    const flags = new Flags({
      // performance: true
      playerDeath: true,
      respawn: true,
      spawn: true
      // stats: true
      // timings: true
    })
    super({
      flags,
      promptbook: props.promptbook,
      promptbookName: props.promptbookName
    })
    this.nature.addFamilies()
    this.nature.addStarTrees()
    this.nature.addRock({
      position: Vec2(0, 25),
      halfHeight: 10,
      halfWidth: 5
    })
    this.nature.addRock({
      position: Vec2(25, 0),
      halfHeight: 5,
      halfWidth: 10
    })
    this.nature.addRock({
      position: Vec2(0, 15),
      halfHeight: 10,
      halfWidth: 10
    })
    this.nature.addRock({
      position: Vec2(15, 0),
      halfHeight: 10,
      halfWidth: 10
    })
    this.nature.addRock({
      position: Vec2(0, 20),
      halfHeight: 5,
      halfWidth: 5
    })
    this.nature.addRock({
      position: Vec2(20, 0),
      halfHeight: 1,
      halfWidth: 5
    })
    this.nature.addRock({
      position: Vec2(10, 0),
      halfHeight: 5,
      halfWidth: 1
    })
    this.nature.addRock({
      position: Vec2(0, 10),
      halfHeight: 1,
      halfWidth: 1
    })
  }
}
