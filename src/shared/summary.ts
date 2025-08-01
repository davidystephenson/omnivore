import { ClientElement, Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'
import { Controls } from './input'
import { Rgb } from './color'

export interface Summary {
  age?: number
  controls?: Controls
  curtains?: ClientElement[]
  debugLines?: DebugLine[]
  debugCircles?: DebugCircle[]
  extinct: boolean
  features?: Element[]
  foodCount?: number
  fps: number
  highlight?: Rgb
  id?: number
  points?: number
  ropes?: Rope[]
  respawn: number
  speed?: number
  stamina?: number
  strength?: number
}
