import { Flags } from '../flags'
import { Promptbook } from '../types'
import { Performance } from './performance'

export class PublicPerformance extends Performance {
  constructor (props: {
    promptbook: Promptbook
    promptbookName: string
  }) {
    const flags = new Flags({
      families: true,
      // singleGame: true,
      indigenous: true
      // performance: true
      // playerDeath: true
      // respawn: true
      // spawn: true
      // stats: true
      // timings: true
      // hungerGame: false
    })
    super({
      flags,
      promptbook: props.promptbook,
      promptbookName: props.promptbookName
    })
    this.nature.spawnFamilies({ count: 4 })
    // this.nature.addCenterTree()
    this.nature.addStarTrees()
    // this.nature.addRiver({
    //   position: Vec2(0, 0),
    //   vertices: [
    //     new Vec2(-5, 0),
    //     new Vec2(5, -0.5),
    //     new Vec2(5, 0.5)
    //   ],
    //   force: Vec2(0, 0),
    //   speed: 0
    // })
    // this.nature.addRiver({
    //   position: Vec2(80, 80),
    //   vertices: [
    //     new Vec2(-5, 0),
    //     new Vec2(5, -0.5),
    //     new Vec2(5, 0.5)
    //   ],
    //   force: Vec2(0, 0),
    //   speed: 0
    // })
    // this.nature.addRock({
    //   position: Vec2(80, 80),
    //   halfWidth: 5,
    //   halfHeight: 1
    // })
    // this.nature.addRock({
    //   position: Vec2(45, -45),
    //   halfWidth: 5,
    //   halfHeight: 1
    // })
    // this.nature.addRock({
    //   position: Vec2(-45, -45),
    //   halfWidth: 5,
    //   halfHeight: 1
    // })
  }
}
