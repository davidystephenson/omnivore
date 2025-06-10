import { Flags } from '../flags'
import { Performance } from './performance'
import { Promptbook } from '../types'
import { Vec2 } from 'planck'

export class TestPerformance extends Performance {
  playerGene = this.flyGene

  constructor (props: {
    promptbook: Promptbook
  }) {
    super({
      flags: new Flags({
        // botFlee: true,
        // charge: true,
        // controlLines: true,
        // curtains: true,
        // damage: true,
        // death: true,
        growGame: false,
        hungerGame: false,
        // playerControl: true
        // playerDeath: true
        playerNearest: true,
        reproduceGame: false,
        spawnpoints: true
        // waypoints: true
      }),
      promptbook: props.promptbook
    })
    // const trisolaran = this.addTrisolaran({ position: Vec2(3, 3) })
    // trisolaran.membrane.hungerDamage = 0.99
    // this.addFruit({ position: Vec2(-7, 7) })
    // this.addTrisolaran({ position: Vec2(0, 7) })
    // this.addHunter({ position: Vec2(2, 7) })
    // this.addBrick({ position: Vec2(-20, -20), halfHeight: 15, halfWidth: 15 })
    // this.addBrick({
    //   halfHeight: 10,
    //   halfWidth: 5,
    //   position: Vec2(0, 0)
    // })
    this.addBrick({ position: Vec2(20, -15), halfHeight: 2, halfWidth: 2 })
    // this.addBrick({ position: Vec2(15, -15), halfHeight: 1, halfWidth: 1 })
    // this.addTree({ position: Vec2(-5, -5) })
    // this.addBrick({ position: Vec2(-7, -7), halfHeight: 1, halfWidth: 10 })
    // this.addBrick({ position: Vec2(20, -25), halfHeight: 10, halfWidth: 5 })
    // this.addTree({ position: Vec2(-10, -10) })
    // this.addStarTrees()
    // this.addFamilies()
  }
}
