import { BodyDef, BodyType, FixtureDef, RopeJoint, Shape, Vec2 } from 'planck'
import { Feature } from '../feature/feature'
import { Stage } from '../stage'
import { Color } from '../color'

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

  createFeature (props: {
    position: Vec2
    shape: Shape
    color: Color
    label: string
    type?: BodyType
  }): Feature {
    const type = props.type ?? 'dynamic'
    const bodyDef: BodyDef = {
      type,
      position: props.position,
      bullet: true,
      fixedRotation: true,
      linearDamping: 0.1
    }
    const fixtureDef: FixtureDef = {
      shape: props.shape,
      density: 1,
      restitution: 0
    }
    const feature = new Feature({
      bodyDef,
      fixtureDef,
      label: props.label,
      color: props.color,
      actor: this
    })
    this.features.push(feature)
    return feature
  }
}
