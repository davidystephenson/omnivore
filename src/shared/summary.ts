import { ClientElement, Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'
import { Controls } from './input'

export interface Summary {
  age?: number
  controls?: Controls
  curtains?: ClientElement[]
  debugLines?: DebugLine[]
  debugCircles?: DebugCircle[]
  features?: Element[]
  foodCount?: number
  fps: number
  id?: number
  ropes?: Rope[]
  respawn: number
  speed?: number
  stamina?: number
}
