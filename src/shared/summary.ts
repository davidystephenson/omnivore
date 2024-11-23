import { Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'
import { Controls } from './input'

export interface Summary {
  elements: Element[]
  ropes: Rope[]
  debugLines: DebugLine[]
  debugCircles: DebugCircle[]
  foodCount: number
  id: number
  controls: Controls
}
