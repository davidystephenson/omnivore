import { CircleShape, RopeJoint } from 'planck'
import { Feature } from '../feature/feature'
import { Stage } from '../stage/stage'
import { GRAY } from '../../shared/color'

export class Actor {
  static count = 0
  features: Feature[] = []
  joints: RopeJoint[] = []
  stage: Stage
  label: string
  id: number
  invincibleTime = 0
  tree: boolean

  constructor (props: {
    stage: Stage
    label: string
  }) {
    this.stage = props.stage
    this.label = props.label
    Actor.count += 1
    this.id = Actor.count
    this.stage.actors.set(this.id, this)
    this.tree = false
  }

  destroy (): void {
    this.stage.actors.delete(this.id)
    this.features.forEach(feature => feature.destroy())
    this.joints.forEach(joint => this.stage.world.destroyJoint(joint))
  }

  onStep (props: {
    stepSize: number
  }): void {
    if (this.stage.flags.actors) {
      const position = this.features[0].body.getPosition()
      const circle = new CircleShape(position, 0.5)
      this.stage.debugCircle({ circle, color: GRAY })
    }
    this.features.forEach(feature => feature.onStep(props.stepSize))
  }
}
