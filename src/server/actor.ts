import { Body, BodyDef, Fixture, FixtureDef } from 'planck'
import { Stage } from './stage'
import { Feature } from './feature'
import { Color } from './color'

export class Actor {
  body: Body
  features: Feature[] = []
  label = 'default'
  stage: Stage

  constructor (props: {
    bodyDef: BodyDef
    label?: string
    stage: Stage
  }) {
    this.stage = props.stage
    this.body = this.stage.world.createBody(props.bodyDef)
    this.body.setUserData(this)
    this.label = props.label ?? this.label
  }

  createFeature(props: {
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
