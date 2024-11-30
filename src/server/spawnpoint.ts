import { Vec2, Fixture, CircleShape } from 'planck'
import { Spawner } from './spawner'

export class Spawnpoint {
  spawner: Spawner
  position: Vec2
  fixture: Fixture
  collideCount = 0

  constructor (spawner: Spawner, position: Vec2) {
    this.spawner = spawner
    this.position = position
    const circleShape = new CircleShape(position, 1.25)
    this.fixture = this.spawner.body.createFixture({
      shape: circleShape,
      isSensor: true
    })
    this.fixture.setUserData(this)
  }
}
