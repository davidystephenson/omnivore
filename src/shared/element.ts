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
  borderWidth: number
  visible: boolean
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
    id: number
    borderWidth: number
    color: Color
    feature: Feature
    stage: Stage
  }) {
    this.visible = true
    this.position = props.feature.body.getPosition()
    this.angle = props.feature.body.getAngle()
    const healthRatio = props.feature.health / props.feature.maximumHealth
    this.color = new Color({
      red: props.color.red,
      green: props.color.green,
      blue: props.color.blue,
      alpha: healthRatio
    })
    this.borderWidth = props.borderWidth
    this.id = props.id
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
      // this.food = {
      //   polygons: props.feature.actor.foodPolygons
      // }
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
