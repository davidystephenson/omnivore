import { Vec2 } from 'planck'
import { GREEN, Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Sculpture } from './sculpture'
import { Feature } from './feature'

export class Serving extends Sculpture {
  constructor (props: {
    actor: Actor
    color?: Rgb
    position: Vec2
    vertices: Vec2[]
  }) {
    const color = props.color ?? GREEN
    super({
      label: 'serving',
      position: props.position,
      vertices: props.vertices,
      color,
      actor: props.actor
    })
  }

  handleContact (props: {
    target: Feature
  }): void {}
}
