import { Circle, Vec2 } from 'planck'
import { Actor } from './actor'
import { Stage } from './stage'
import { Color } from './color'

export class Ball extends Actor {
  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({
      bodyDef: {
        type: 'dynamic',
        position: props.position,
        bullet: true,
        fixedRotation: true,
        linearDamping: 1
      },
      label: 'player',
      stage: props.stage
    })
    this.label = 'player'
    const fixtureDef = {
      shape: new Circle(Vec2(0, 0), 1),
      density: 1,
      restitution: 0
    }
    const color = new Color({ red: 0, green: 0, blue: 0 })
    this.createFeature({ fixtureDef, color })
  }
}
