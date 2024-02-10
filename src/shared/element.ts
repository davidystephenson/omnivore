import { CircleShape, PolygonShape, Vec2 } from 'planck'
import { Feature } from '../server/feature/feature'
import { Color } from './color'

export class Element {
  angle: number
  position: Vec2
  id: number
  color: Color
  borderColor: Color
  borderWidth: number
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
    this.position = props.feature.body.getPosition()
    this.angle = props.feature.body.getAngle()
    this.color = props.feature.color
    this.borderColor = props.feature.borderColor
    this.borderWidth = props.feature.borderWidth
    this.id = props.feature.id
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
