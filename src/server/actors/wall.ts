import { Box, Vec2 } from 'planck'
import { Actor } from './actor'
import { Stage } from '../stage'
import { Color } from '../color'

export class Wall extends Actor {
  constructor (props: {
    stage: Stage
    halfWidth: number
    halfHeight: number
    position: Vec2
  }) {
    super({
      bodyDef: {
        type: 'static',
        position: props.position
      },
      label: 'wall',
      stage: props.stage
    })
    const fixtureDef = {
      shape: new Box(props.halfWidth, props.halfHeight),
      density: 1,
      restitution: 0
    }
    const color = new Color({ red: 100, green: 100, blue: 100 })
    this.createFeature({ fixtureDef, color })
  }
}
