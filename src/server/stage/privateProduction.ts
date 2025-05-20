import { Flags } from '../flags'
import { Production } from './production'
import { Promptbook } from '../types'
import { Vec2 } from 'planck'

export class PrivateProduction extends Production {
  playerGene = this.flyBullyGene

  constructor (props: {
    promptbook: Promptbook
  }) {
    super({
      flags: new Flags({
        // damage: true,
        // death: true,
        botFlee: true,
        performance: false,
        hungerGame: false
        // spawn: true
      }),
      promptbook: props.promptbook
    })
    this.addTrisolaran({ position: Vec2(10, 10) })
    // this.addBrick({ position: Vec2(-20, -20), halfHeight: 15, halfWidth: 15 })
    // this.addBrick({ position: Vec2(20, -20), halfHeight: 5, halfWidth: 5 })
    // this.addBrick({ position: Vec2(20, -15), halfHeight: 2, halfWidth: 2 })
    // this.addBrick({ position: Vec2(25, -20), halfHeight: 1, halfWidth: 1 })
    // this.addBrick({ position: Vec2(20, -25), halfHeight: 10, halfWidth: 5 })
    // this.addTree({ position: Vec2(-10, -10) })
    // this.addStarTrees()
    // this.addFamilies()
  }
}
