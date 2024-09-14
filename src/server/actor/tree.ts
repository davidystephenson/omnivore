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
  seedVertices: Vec2[] = []
  step = 0
  growing: boolean

  constructor (props: {
    stage: Stage
    position: Vec2
    growing?: boolean
  }) {
    super({ stage: props.stage, label: 'tree' })
    this.growing = props.growing ?? true
    this.seedVertices = this.getVertices(1)
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

  getVertices (radius: number): Vec2[] {
    const turns = [1 / 4, 7 / 12, 11 / 12]
    const angles = turns.map(turn => 2 * Math.PI * turn)
    return angles.map(angle => {
      return Vec2(radius * Math.cos(angle), radius * Math.sin(angle))
    })
  }

  setupVertices (): void {
    this.vertices = this.getVertices(this.radius)
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

  drop (): void {
    this.radius = 1
    this.vertices = this.seedVertices
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
  }
}
