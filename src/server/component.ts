import { Vec2 } from 'planck'
import { Actor } from './actor'
import { Element } from './element'

export class Component {
  elements: Element[]
  angle: number
  position: Vec2

  constructor (props: {
    actor: Actor
  }) {
    this.elements = props
      .actor
      .features
      .map(feature => new Element({ feature }))
    this.position = props.actor.body.getPosition()
    this.angle = props.actor.body.getAngle()
  }
}
