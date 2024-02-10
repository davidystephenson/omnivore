import { RopeJoint, Vec2 } from 'planck'
import { Feature } from '../feature/feature'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Mouth } from '../feature/mouth'

export class Player extends Actor {
  eye: Feature
  mouths: Feature[] = []

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'player' })
    this.eye = this.createMouth({ position: props.position })
    this.eye.borderWidth = 0.2
    const mouth = this.createMouth({
      position: Vec2.add(props.position, Vec2(0, 3)),
      cell: this.eye
    })
    this.createMouth({
      position: Vec2.add(mouth.body.getPosition(), Vec2(0, 3)),
      cell: mouth
    })
  }

  createMouth (props: {
    position: Vec2
    cell?: Feature
  }): Mouth {
    const mouth = new Mouth({ position: props.position, actor: this })
    if (props.cell != null) {
      const joint = new RopeJoint({
        bodyA: props.cell.body,
        bodyB: mouth.body,
        localAnchorA: Vec2(0, 0),
        localAnchorB: Vec2(0, 0),
        collideConnected: true,
        maxLength: 3
      })
      this.joints.push(joint)
      this.stage.world.createJoint(joint)
    }
    this.mouths.push(mouth)
    this.features.push(mouth)
    return mouth
  }
}
