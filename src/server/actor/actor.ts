import { RopeJoint } from 'planck'
import { Feature } from '../feature/feature'
import { Stage } from '../stage'

export class Actor {
  static count = 0
  features: Feature[] = []
  joints: RopeJoint[] = []
  stage: Stage
  label: string
  id: number
  invincibleTime = 0

  constructor (props: {
    stage: Stage
    label: string
  }) {
    this.stage = props.stage
    this.label = props.label
    Actor.count += 1
    this.id = Actor.count
    this.stage.actors.set(this.id, this)
  }

  onStep (): void {
    this.features.forEach(feature => feature.onStep())
    // this.invincibleTime = Math.max(0, this.invincibleTime - this.stage.runner.timeStep)
  }
}
