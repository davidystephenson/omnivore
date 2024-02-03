import { Box, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Color } from '../color'
import { Actor } from './actor'

export class Wall extends Actor {
  constructor (props: {
    stage: Stage
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'wall' })
    this.createFeature({
      position: props.position,
      type: 'static',
      shape: new Box(props.halfWidth, props.halfHeight),
      color: new Color({ red: 100, green: 100, blue: 100 }),
      label: 'wall'
    })
  }
}
