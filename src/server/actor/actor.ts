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
}
