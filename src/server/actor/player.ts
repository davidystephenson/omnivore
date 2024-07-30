import { Vec2 } from 'planck'
import { Stage } from '../stage'
import { Organism } from './organism'
import { Tree } from '../tree'

export class Player extends Organism {
  constructor (props: {
    position: Vec2
    stage: Stage
    tree: Tree
  }) {
    super({
      position: props.position,
      stage: props.stage,
      tree: props.tree
    })
    this.membrane.forceScale = 2
  }
}
