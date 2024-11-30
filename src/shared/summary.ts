import { Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'
import { Controls } from './input'

export interface Summary {
  age: number
  controls: Controls
  debugLines: DebugLine[]
  debugCircles: DebugCircle[]
  elements: Element[]
  foodCount: number
  fps: number
  id: number
  ropes: Rope[]
}
