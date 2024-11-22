import { Vec2, Fixture, CircleShape } from 'planck'
import { Spawner } from './spawner'

export class Spawnpoint {
  spawner: Spawner
  location: Vec2
  fixture: Fixture
  collideCount = 0

  constructor (spawner: Spawner, location: Vec2) {
    this.spawner = spawner
    this.location = location
    this.fixture = this.spawner.body.createFixture({
      shape: new CircleShape(1.25),
      isSensor: true
    })
    this.fixture.setUserData(this)
  }
}
