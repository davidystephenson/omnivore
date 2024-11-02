import { Vec2 } from 'planck'
import { Color } from './color'

export interface Element {
  id: number
  position: Vec2
  angle: number
  scale: number
  alpha: number
  color?: Color
  borderWidth?: number
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

export interface CompleteElement {
  id: number
  position: Vec2
  angle: number
  scale: number
  alpha: number
  color: Color
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
}

export interface ClientElement extends CompleteElement {
  visible: boolean
}
