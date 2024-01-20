
import { Body, Fixture, FixtureDef } from 'planck'
import { Actor } from './actor'
import { Color } from './color'

export class Feature {
  actor: Actor
  color: Color
  fixture: Fixture

  constructor(props: {
    actor: Actor
    fixtureDef: FixtureDef
    color: Color
  }) {
    this.actor = props.actor
    this.color = props.color
    this.fixture = this.actor.body.createFixture(props.fixtureDef)
    this.fixture.setUserData(this)
  }
}
