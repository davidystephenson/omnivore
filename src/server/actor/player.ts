import { Circle, RopeJoint, Vec2 } from 'planck'
import { Feature } from '../feature/feature'
import { Stage } from '../stage'
import { Color } from '../color'
import { Actor } from './actor'

export class Player extends Actor {
  eye: Feature
  mouths: Feature[] = []

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'player' })
    this.eye = this.createMouth({ position: props.position })
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
  }): Feature {
    const mouth = this.createFeature({
      position: props.position,
      shape: new Circle(Vec2(0, 0), 1),
      color: new Color({ red: 0, green: 0, blue: 255 }),
      label: 'mouth'
    })
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
    return mouth
  }
}
