import { Vec2 } from 'planck'
import { Color } from './color'
import { Feature } from '../server/feature/feature'
import { Tree } from '../server/actor/tree'
import { Sculpture } from '../server/feature/sculpture'

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

export function getElement (feature: Feature, first?: boolean): Element {
  const element: Element = {
    id: feature.id,
    position: feature.body.getPosition(),
    angle: feature.body.getAngle(),
    scale: 1,
    alpha: feature.color.alpha
  }
  if (first != null) {
    element.color = feature.color
    element.borderWidth = feature.borderWidth
    if (feature.radius > 0) {
      element.circle = {
        center: feature.center,
        radius: feature.radius
      }
    } else {
      element.polygon = feature.polygon
    }
    if (feature instanceof Sculpture) {
      if (feature.seed != null) {
        element.seed = feature.seed
      }
    }
  }
  return element
}
