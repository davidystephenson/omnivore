import { Vec2 } from 'planck'
import { GREEN } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Sculpture } from './sculpture'
import { Feature } from './feature'

export class Serving extends Sculpture {
  constructor (props: {
    position: Vec2
    actor: Actor
    vertices: Vec2[]
  }) {
    super({
      label: 'serving',
      position: props.position,
      vertices: props.vertices,
      color: GREEN,
      actor: props.actor
    })
  }

  handleContact (props: {
    target: Feature
  }): void {}
}
