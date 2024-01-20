import { World, Vec2 } from 'planck'

export class Stage {
  world: World

  constructor () {
    this.world = new World({ gravity: Vec2(0, 0) })
  }
}
