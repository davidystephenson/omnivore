import { Body, CircleShape, PolygonShape, Shape, Vec2 } from 'planck'
// import { Color } from './color'

export class Element {
  angle: number
  position: Vec2
  id: number
  color: any
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
    body: Body
    alpha: number
    id: number
    borderWidth: number
    color: any
    shape: Shape
    tree: boolean
    vertices?: Vec2[]
    seedVertices?: Vec2[]
  }) {
    this.visible = true
    this.position = props.body.getPosition()
    this.angle = props.body.getAngle()
    // this.color = new Color({
    //   red: props.color.red,
    //   green: props.color.green,
    //   blue: props.color.blue,
    //   alpha: props.alpha
    // })
    this.borderWidth = props.borderWidth
    this.id = props.id
    if (props.shape instanceof CircleShape) {
      this.circle = {
        center: props.shape.getCenter(),
        radius: props.shape.getRadius()
      }
    } else if (props.tree) {
      if (props.vertices != null) {
        this.polygon = {
          vertices: props.vertices
        }
      }
      if (props.seedVertices != null) {
        this.seed = {
          vertices: props.seedVertices
        }
      }
    } else if (props.shape instanceof PolygonShape) {
      this.polygon = {
        vertices: props.shape.m_vertices
      }
    } else {
      const type: string = props.shape.getType()
      throw new Error(`Invalid shape ${type}`)
    }
  }
}
