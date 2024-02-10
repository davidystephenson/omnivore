import { Body, BodyDef, Fixture, FixtureDef, Vec2 } from 'planck'
import { Color } from '../../shared/color'
import { Actor } from '../actor/actor'

export class Feature {
  body: Body
  fixture: Fixture
  force = Vec2(0, 0)
  label = 'default'
  actor: Actor
  id: number
  borderWidth: number
  color: Color
  borderColor: Color
  health = 1

  constructor (props: {
    bodyDef: BodyDef
    fixtureDef: FixtureDef
    label?: string
    actor: Actor
    color: Color
    borderColor: Color
    borderWidth?: number
  }) {
    this.actor = props.actor
    this.body = this.actor.stage.world.createBody(props.bodyDef)
    this.body.setUserData(this)
    this.label = props.label ?? this.label
    this.fixture = this.body.createFixture(props.fixtureDef)
    this.fixture.setUserData(this)
    this.color = props.color
    this.borderColor = props.borderColor
    this.borderWidth = props.borderWidth ?? 0.1
    actorCount += 1
    this.id = actorCount
  }
}

let actorCount = 0
