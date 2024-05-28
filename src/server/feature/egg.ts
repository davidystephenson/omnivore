import { Vec2, Box } from 'planck'
import { Color } from '../../shared/color'
import { Player } from '../actor/player'
import { Chunk } from './chunk'

export class Egg extends Chunk {
  actor: Player
  constructor (props: {
    actor: Player
    position: Vec2
    hx: number
    hy: number
  }) {
    super({
      position: props.position,
      actor: props.actor,
      shape: new Box(props.hx, props.hy),
      color: Color.WHITE,
      label: 'egg',
      name: 'rectangle'
    })
    this.actor = props.actor
  }
}
