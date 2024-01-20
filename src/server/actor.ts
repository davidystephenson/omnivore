import { Body, BodyDef, World, FixtureDef } from 'planck'
import { Stage } from './stage'

export class Actor {
  body: Body
  label = 'default'
  stage: Stage
  world: World

  constructor (props: {
    bodyDef: BodyDef
    label?: string
    stage: Stage
  }) {
    this.world = props.stage.world
    this.stage = props.stage
    this.body = this.world.createBody(props.bodyDef)
    this.body.setUserData(this)
    this.label = props.label ?? this.label
  }
}
