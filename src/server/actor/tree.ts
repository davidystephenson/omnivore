import { PolygonShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Sculpture } from '../feature/sculpture'
import { Color } from '../../shared/color'

export class Tree extends Actor {
  sculpture: Sculpture
  radius = 1
  growthRate = 0.5
  vertices: Vec2[] = []
  step = 0

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'tree' })
    this.setupVertices()
    this.sculpture = new Sculpture({
      actor: this,
      color: Color.LIME,
      position: props.position,
      vertices: this.vertices
    })
    this.sculpture.health = 0.0000000000000000001
    this.features.push(this.sculpture)
  }

  setupVertices (): void {
    const turns = [1 / 4, 7 / 12, 11 / 12]
    const angles = turns.map(turn => 2 * Math.PI * turn)
    this.vertices = angles.map(angle => {
      return Vec2(this.radius * Math.cos(angle), this.radius * Math.sin(angle))
    })
  }

  grow (stepSize: number): void {
    this.step += 1
    this.radius = this.radius + stepSize * this.growthRate
    if (this.step % 2 === 0) {
      this.sculpture.body.destroyFixture(this.sculpture.fixture)
      this.stage.log({ value: 'tree onStep' })
      this.setupVertices()
      this.sculpture.fixture = this.sculpture.body.createFixture({
        shape: new PolygonShape(this.vertices),
        density: 1,
        restitution: 0,
        friction: 0
      })
      this.sculpture.body.setUserData(this.sculpture)
      this.sculpture.fixture.setUserData(this.sculpture)
    }
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)

    // const shape = this.sculpture.fixture.getShape()
    // if (shape instanceof PolygonShape) {
    //   shape.m_vertices = this.getVertices(4)
    //   this.sculpture.body.resetMassData()
    // }
  }
}
