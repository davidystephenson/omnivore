import { Vec2 } from 'planck'
import { Color } from './color'

export interface Element {
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
}
