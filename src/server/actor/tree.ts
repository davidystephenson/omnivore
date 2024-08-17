import { PolygonShape, Vec2 } from 'planck'
import { Stage } from '../stage'
import { Actor } from './actor'
import { Sculpture } from '../feature/sculpture'
import { Color } from '../../shared/color'

export class Tree extends Actor {
  sculpture: Sculpture
  radius = 1
  growthRate = 1

  constructor (props: {
    stage: Stage
    position: Vec2
  }) {
    super({ stage: props.stage, label: 'tree' })
    this.sculpture = new Sculpture({
      actor: this,
      color: Color.LIME,
      position: props.position,
      vertices: this.getVertices(this.radius)
    })
    this.sculpture.health = 0.0000000000000000001
    this.features.push(this.sculpture)
  }

  getVertices (radius: number): Vec2[] {
    const turns = [1 / 4, 7 / 12, 11 / 12]
    const angles = turns.map(turn => 2 * Math.PI * turn)
    const vertices = angles.map(angle => {
      return Vec2(radius * Math.cos(angle), radius * Math.sin(angle))
    })
    return vertices
  }

  onStep (stepSize: number): void {
    super.onStep(stepSize)
    this.radius += stepSize * this.growthRate
    const shape = this.sculpture.fixture.getShape()
    if (shape instanceof PolygonShape) {
      shape.m_vertices = this.getVertices(this.radius)
    }
  }
}
