import { CircleShape, PolygonShape, Vec2 } from 'planck'
import { Feature } from '../server/feature/feature'
import { Color } from './color'
import { Stage } from '../server/stage'
import { Tree } from '../server/actor/tree'

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

  seed?: {
    vertices: Vec2[]
  }

  food?: {
    polygons: Vec2[][]
  }

  constructor (props: {
    feature: Feature
    stage: Stage
  }) {
    this.position = props.feature.body.getPosition()
    this.angle = props.feature.body.getAngle()
    this.borderColor = props.feature.color
    const healthRatio = props.feature.health / props.feature.maximumHealth
    this.color = new Color({
      red: props.feature.color.red,
      green: props.feature.color.green,
      blue: props.feature.color.blue,
      alpha: healthRatio
    })
    this.borderWidth = props.feature.borderWidth
    this.id = props.feature.id
    const shape = props.feature.fixture.getShape()
    if (shape instanceof CircleShape) {
      this.circle = {
        center: shape.getCenter(),
        radius: shape.getRadius()
      }
    } else if (props.feature.actor instanceof Tree) {
      this.polygon = {
        vertices: props.feature.actor.vertices
      }
      this.seed = {
        vertices: props.feature.actor.seedVertices
      }
      this.food = {
        polygons: props.feature.actor.foodPolygons
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
