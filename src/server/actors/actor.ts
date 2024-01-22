import { Body, BodyDef, FixtureDef, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Feature } from '../feature'
import { Color } from '../color'

export class Actor {
  body: Body
  force = Vec2(0, 0)
  features: Feature[] = []
  label = 'default'
  stage: Stage
  id: number

  constructor (props: {
    bodyDef: BodyDef
    label?: string
    stage: Stage
  }) {
    this.stage = props.stage
    this.body = this.stage.world.createBody(props.bodyDef)
    this.body.setUserData(this)
    this.label = props.label ?? this.label
    actorCount += 1
    this.id = actorCount
  }

  createFeature (props: {
    fixtureDef: FixtureDef
    color: Color
  }): Feature {
    const feature = new Feature({
      actor: this,
      fixtureDef: props.fixtureDef,
      color: props.color
    })
    this.features.push(feature)
    return feature
  }
}

let actorCount = 0
