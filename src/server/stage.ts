import { World, Vec2 } from 'planck'
import { Runner } from './runner'
import { Ball } from './ball'

export class Stage {
  world: World
  runner: Runner
  ball: Ball

  constructor () {
    this.world = new World({ gravity: Vec2(0, 0) })
    this.runner = new Runner({ stage: this })
    this.ball = this.addBall({ position: Vec2(0, 0) })
  }

  addBall (props: { position: Vec2 }): Ball {
    const ball = new Ball({ stage: this, position: props.position })
    return ball
  }

  onStep (): void {
    // console.log('ball.body.getPosition()', this.ball.body.getPosition())
    // this.ball.body.applyForceToCenter(Vec2(1, 0))
  }
}
