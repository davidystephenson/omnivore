import { World, Vec2 } from 'planck'
import { Runner } from './runner'
import { Player } from './actors/player'
import { Wall } from './actors/wall'

export class Stage {
  world: World
  runner: Runner

  constructor () {
    this.world = new World({ gravity: Vec2(0, 0) })
    this.runner = new Runner({ stage: this })
    this.addWall({ halfWidth: 10, halfHeight: 1, position: Vec2(0, 10) })
    this.addWall({ halfWidth: 10, halfHeight: 1, position: Vec2(0, -10) })
    this.addWall({ halfWidth: 1, halfHeight: 15, position: Vec2(20, 0) })
    this.addWall({ halfWidth: 1, halfHeight: 15, position: Vec2(-20, 0) })
  }

  addPlayer (props: { position: Vec2 }): Player {
    const player = new Player({ stage: this, ...props })
    return player
  }

  addWall (props: { halfWidth: number, halfHeight: number, position: Vec2 }): Wall {
    const wall = new Wall({ stage: this, ...props })
    return wall
  }

  onStep (): void {}
}
