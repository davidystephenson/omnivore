import { Vec2, Fixture, CircleShape, Circle } from 'planck'
import { Spawner } from './spawner'
import { Rgb } from '../shared/color'

export class Spawnpoint {
  spawner: Spawner
  position: Vec2
  fixture: Fixture
  collideCount = 0

  constructor (spawner: Spawner, position: Vec2) {
    this.spawner = spawner
    this.position = position
    const circleShape = new CircleShape(position, Spawner.RADIUS)
    this.fixture = this.spawner.body.createFixture({
      shape: circleShape,
      isSensor: true
    })
    this.fixture.setUserData(this)
  }

  debug (props: {
    color: Rgb
  }): void {
    const transparent = { ...props.color, alpha: 0.1 }
    this.spawner.stage.debugCircle({
      circle: new Circle(this.position, Spawner.RADIUS),
      color: transparent
    })
  }
}
