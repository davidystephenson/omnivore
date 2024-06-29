import { Vec2, Box } from 'planck'
import { Color } from '../../shared/color'
import { Organism } from '../actor/organism'
import { Prop } from './prop'

export class Egg extends Prop {
  actor: Organism
  constructor (props: {
    actor: Organism
    position: Vec2
    hx: number
    hy: number
  }) {
    super({
      position: props.position,
      actor: props.actor,
      shape: new Box(props.hx, props.hy),
      color: Color.WHITE,
      label: 'egg'
    })
    this.actor = props.actor
  }
}
