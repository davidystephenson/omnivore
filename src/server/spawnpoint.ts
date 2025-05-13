import { Vec2, Fixture, CircleShape } from 'planck'
import { Spawner } from './spawner'
import { HALF_SIGHT_WIDTH } from '../shared/sight'

export class Spawnpoint {
  static RADIUS = HALF_SIGHT_WIDTH
  spawner: Spawner
  position: Vec2
  fixture: Fixture
  collideCount = 0

  constructor (spawner: Spawner, position: Vec2) {
    this.spawner = spawner
    this.position = position
    const circleShape = new CircleShape(position, Spawnpoint.RADIUS)
    this.fixture = this.spawner.body.createFixture({
      shape: circleShape,
      isSensor: true
    })
    this.fixture.setUserData(this)
  }
}
