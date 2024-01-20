import { CircleShape, PolygonShape, Vec2 } from 'planck'
import { Color } from './color'
import { Feature } from './feature'

export class Element {
  color: Color
  circle?: {
    center: Vec2
    radius: number
  }

  polygon?: {
    vertices: Vec2[]
  }

  constructor (props: {
    feature: Feature
  }) {
    this.color = props.feature.color
    const shape = props.feature.fixture.getShape()
    if (shape instanceof CircleShape) {
      this.circle = {
        center: shape.getCenter(),
        radius: shape.getRadius()
      }
    } else if (shape instanceof PolygonShape) {
      this.polygon = {
        vertices: shape.m_vertices
      }
    } else {
      const type: string = shape.getType()
      throw new Error(`Invalid shape ${type}`)
    }
  }
}
