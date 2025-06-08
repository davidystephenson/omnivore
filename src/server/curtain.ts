import { Vec2, Fixture, Box, BoxShape } from 'planck'
import { Spawner } from './spawner'
import { Rgb } from '../shared/color'
import { roundNumber, roundVector } from './math'
import { Element } from '../shared/element'

export class Curtain {
  box: BoxShape
  spawner: Spawner
  position: Vec2
  sensor: Fixture
  collideCount = 0

  constructor (props: {
    spawner: Spawner
    position: Vec2
    size: Vec2
  }) {
    this.spawner = props.spawner
    this.position = props.position
    this.box = new Box(props.size.x, props.size.y, this.position)
    this.sensor = this.spawner.body.createFixture({
      shape: this.box,
      isSensor: true
    })
    this.sensor.setUserData(this)
  }

  debug (props: {
    color: Rgb
  }): void {
    this.spawner.stage.debugPolygon({
      polygon: this.box,
      color: props.color
    })
  }

  getElement (): Element {
    const angle = this.spawner.body.getAngle()
    const i = Math.random()
    const n = roundNumber({ number: angle, decimals: 3 })
    const v = this.box.m_vertices.map(vertex => {
      return roundVector({ vector: vertex })
    })
    const element: Element = {
      i,
      x: 0,
      y: 0,
      n,
      s: 1,
      a: 1,
      r: 25,
      g: 25,
      b: 25,
      o: 0,
      v
    }
    return element
  }
}
