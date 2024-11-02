import { Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'

export interface Summary {
  elements: Element[]
  ropes: Rope[]
  debugLines: DebugLine[]
  debugCircles: DebugCircle[]
  foodCount: number
  id: number
}
