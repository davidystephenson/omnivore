import { Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'
import { DebugCircle } from './debugCircle'

export class Summary {
  elements: Element[]
  ropes: Rope[]
  debugLines: DebugLine[]
  debugCircles: DebugCircle[]
  id: number

  constructor (props: {
    elements: Element[]
    ropes: Rope[]
    debugLines: DebugLine[]
    debugCircles: DebugCircle[]
    id: number
  }) {
    this.elements = props.elements
    this.ropes = props.ropes
    this.debugLines = props.debugLines
    this.debugCircles = props.debugCircles
    this.id = props.id
  }
}
