import { Vec2, Fixture, Box, BoxShape } from 'planck'
import { Spawner } from './spawner'
import { Rgb } from '../shared/color'
import { HALF_SIGHT_SIZE } from '../shared/sight'

export class Spawnpoint {
  box: BoxShape
  spawner: Spawner
  position: Vec2
  sensor: Fixture
  collideCount = 0

  constructor (spawner: Spawner, position: Vec2) {
    this.spawner = spawner
    this.position = position
    this.box = new Box(HALF_SIGHT_SIZE.x, HALF_SIGHT_SIZE.y, this.position)
    this.sensor = this.spawner.body.createFixture({
      shape: this.box,
      isSensor: true
    })
    this.sensor.setUserData(this)
  }

  debug (props: {
    color: Rgb
  }): void {
    const transparent = { ...props.color, alpha: 0.1 }
    this.spawner.stage.debugPolygon({
      polygon: this.box,
      color: transparent
    })
  }
}
