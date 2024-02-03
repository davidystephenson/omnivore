import { RopeJoint, Vec2 } from 'planck'

export class Rope {
  positionA: Vec2
  positionB: Vec2

  constructor (props: {
    joint: RopeJoint
  }) {
    this.positionA = props.joint.getBodyA().getPosition()
    this.positionB = props.joint.getBodyB().getPosition()
  }
}
