import { Element } from './element'
import { Rope } from './rope'
import { DebugLine } from './debugLine'

export class Summary {
  elements: Element[]
  ropes: Rope[]
  debugLines: DebugLine[]
  id: number

  constructor (props: {
    elements: Element[]
    ropes: Rope[]
    debugLines: DebugLine[]
    id: number
  }) {
    this.elements = props.elements
    this.ropes = props.ropes
    this.debugLines = props.debugLines
    this.id = props.id
  }
}
